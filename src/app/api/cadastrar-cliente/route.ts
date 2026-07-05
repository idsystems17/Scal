import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { checkRateLimit } from '@/lib/security/ratelimit'
import { hashIP } from '@/lib/security/hash'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!(await checkRateLimit(`cadastro:${hashIP(ip)}`, 5, 60 * 60_000))) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
  }

  const { nomeLoja, urlLoja, email, senha } = await req.json()

  if (!nomeLoja || !urlLoja || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }

  if (typeof senha !== 'string' || senha.length < 8) {
    return NextResponse.json({ error: 'A senha precisa ter no mínimo 8 caracteres.' }, { status: 400 })
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { role: 'cliente', nome: nomeLoja },
  })

  if (authError) {
    const msg = authError.message.includes('already been registered')
      ? 'Não foi possível criar a conta com esses dados. Se você já tem cadastro, faça login.'
      : authError.message
    return NextResponse.json({ error: msg }, { status: 400 })
  }

  const { error: clienteError } = await adminClient.from('clientes').insert({
    user_id: authData.user.id,
    nome_loja: nomeLoja,
    url_loja: urlLoja,
    status: 'trial',
  })

  if (clienteError) {
    await adminClient.auth.admin.deleteUser(authData.user.id)
    return NextResponse.json({ error: 'Erro ao configurar a loja. Tente novamente.' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
