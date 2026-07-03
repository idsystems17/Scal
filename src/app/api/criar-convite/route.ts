import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const { clienteId, email } = await req.json()

  if (!clienteId) {
    return NextResponse.json({ error: 'clienteId obrigatório' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  // Garante que o cliente logado é dono desse clienteId
  const { data: cliente } = await supabase
    .from('clientes')
    .select('id')
    .eq('id', clienteId)
    .eq('user_id', user.id)
    .single()

  if (!cliente) {
    return NextResponse.json({ error: 'Acesso negado' }, { status: 403 })
  }

  const { data, error } = await supabase
    .from('convites')
    .insert({ cliente_id: clienteId, email_destinatario: email || null })
    .select('token')
    .single()

  if (error) {
    return NextResponse.json({ error: 'Erro ao gerar convite' }, { status: 500 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '')
    || `https://${req.headers.get('host')}`
  return NextResponse.json({ link: `${appUrl}/convite/${data.token}` })
}
