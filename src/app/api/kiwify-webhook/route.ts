import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Eventos Kiwify que ativam ou suspendem o acesso ao SCAL
export async function POST(req: NextRequest) {
  let payload: Record<string, unknown>
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  const evento = String(payload.event ?? payload.type ?? '')
  const subscriptionId = String(payload.subscription_id ?? payload.id ?? '')
  const email = String((payload.customer as Record<string, unknown>)?.email ?? payload.email ?? '')

  if (!subscriptionId && !email) {
    return NextResponse.json({ error: 'dados_insuficientes' }, { status: 400 })
  }

  // Busca o cliente pelo subscription_id ou email
  let clienteId: string | null = null

  if (subscriptionId) {
    const { data } = await adminClient
      .from('clientes')
      .select('id')
      .eq('kiwify_subscription_id', subscriptionId)
      .maybeSingle()
    clienteId = data?.id ?? null
  }

  if (!clienteId && email) {
    const { data: userList } = await adminClient.auth.admin.listUsers()
    const userMatch = userList?.users.find(u => u.email === email && u.user_metadata?.role === 'cliente')
    if (userMatch) {
      const { data } = await adminClient.from('clientes').select('id').eq('user_id', userMatch.id).maybeSingle()
      clienteId = data?.id ?? null
    }
  }

  if (!clienteId) {
    return NextResponse.json({ ok: true, aviso: 'cliente_nao_encontrado' })
  }

  const updates: Record<string, unknown> = {}

  if (subscriptionId) {
    updates.kiwify_subscription_id = subscriptionId
  }

  if (['order.approved', 'payment.confirmed', 'subscription.activated'].some(e => evento.includes(e) || evento === e)) {
    updates.status = 'ativo'
  } else if (['order.refunded', 'payment.refunded', 'subscription.canceled', 'subscription.suspended'].some(e => evento.includes(e) || evento === e)) {
    updates.status = 'suspenso'
  }

  if (Object.keys(updates).length > 0) {
    await adminClient.from('clientes').update(updates).eq('id', clienteId)
  }

  await adminClient.from('eventos').insert({
    tipo: 'webhook_recebido',
    payload_json: { fonte: 'kiwify', evento, cliente_id: clienteId, ...payload },
    ator_tipo: 'sistema',
    ator_id: clienteId,
  })

  return NextResponse.json({ ok: true })
}
