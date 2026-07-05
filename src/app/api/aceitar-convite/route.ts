import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/ratelimit'
import { hashIP } from '@/lib/security/hash'

function gerarCodigoUnico(nome: string): string {
  return nome.split(' ')[0].toUpperCase().slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase()
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!(await checkRateLimit(`convite:${hashIP(ip)}`, 5, 60 * 60_000))) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
  }

  const { token, nome, email, senha } = await req.json()

  if (!token || !nome || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }

  if (typeof senha !== 'string' || senha.length < 8) {
    return NextResponse.json({ error: 'A senha precisa ter no mínimo 8 caracteres.' }, { status: 400 })
  }

  const { data: convite } = await adminClient
    .from('convites')
    .select('id, cliente_id, usado, expires_at')
    .eq('token', token)
    .maybeSingle()

  if (!convite || convite.usado || new Date(convite.expires_at) < new Date()) {
    return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 400 })
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { role: 'parceiro', cliente_id: convite.cliente_id, nome },
  })

  if (authError || !authData.user) {
    const msg = authError?.message.includes('already been registered')
      ? 'Não foi possível criar a conta com esses dados. Se você já tem cadastro, faça login.'
      : (authError?.message || 'Erro ao criar conta.')
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { error: parceiroError } = await adminClient.from('parceiros').insert({
    user_id: authData.user.id,
    cliente_id: convite.cliente_id,
    nome,
    email,
    codigo_unico: gerarCodigoUnico(nome),
  })

  if (parceiroError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'Erro ao cadastrar parceiro. Tente novamente.' }, { status: 500 })
  }

  await adminClient.from('convites').update({ usado: true }).eq('id', convite.id)
  await adminClient.rpc('atualizar_contagem_parceiros', { p_cliente_id: convite.cliente_id })

  const supabase = await createClient()
  const { error: loginError } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (loginError) {
    return NextResponse.json({ ok: true, autoLoginFalhou: true })
  }

  return NextResponse.json({ ok: true })
}
