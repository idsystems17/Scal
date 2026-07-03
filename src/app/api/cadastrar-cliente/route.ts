import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { nomeLoja, urlLoja, email, senha } = await req.json()

  if (!nomeLoja || !urlLoja || !email || !senha) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios.' }, { status: 400 })
  }

  const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
    email,
    password: senha,
    email_confirm: true,
    user_metadata: { role: 'cliente', nome: nomeLoja },
  })

  if (authError) {
    const msg = authError.message.includes('already been registered')
      ? 'Este email já está cadastrado.'
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
