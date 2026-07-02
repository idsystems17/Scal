import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { validateWebhookSignature } from '@/lib/security/hmac'
import { checkRateLimit } from '@/lib/security/ratelimit'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cliente_id: string }> }
) {
  const { cliente_id } = await params

  if (!checkRateLimit(`webhook:${cliente_id}`, 100, 60_000)) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const rawBody = await req.text()
  const signature = req.headers.get('x-scal-signature') ?? ''

  const { data: cliente } = await adminClient
    .from('clientes')
    .select('id, webhook_secret, status')
    .eq('id', cliente_id)
    .single()

  if (!cliente || cliente.status === 'cancelado') {
    return NextResponse.json({ error: 'cliente_not_found' }, { status: 404 })
  }

  if (!validateWebhookSignature(rawBody, signature, cliente.webhook_secret)) {
    await adminClient.from('eventos').insert({
      tipo: 'erro',
      payload_json: { motivo: 'hmac_invalido', cliente_id },
      ator_tipo: 'sistema',
    })
    return NextResponse.json({ error: 'invalid_signature' }, { status: 401 })
  }

  let payload: Record<string, unknown>
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 })
  }

  await Promise.all([
    adminClient.from('eventos').insert({
      tipo: 'webhook_recebido',
      payload_json: payload,
      ator_tipo: 'sistema',
      ator_id: cliente_id,
    }),
    adminClient
      .from('clientes')
      .update({ webhook_confirmado: true, webhook_ultimo_evento: new Date().toISOString() })
      .eq('id', cliente_id),
  ])

  const pedidoId = String(payload.pedido_id ?? payload.order_id ?? payload.id ?? '')
  const valorVenda = Number(payload.valor ?? payload.total ?? payload.amount ?? 0)
  const statusPedido = String(payload.status ?? 'confirmado').toLowerCase()

  if (!pedidoId) {
    return NextResponse.json({ error: 'pedido_id_obrigatorio' }, { status: 400 })
  }

  const { data: existente } = await adminClient
    .from('conversoes')
    .select('id')
    .eq('cliente_id', cliente_id)
    .eq('pedido_externo_id', pedidoId)
    .maybeSingle()

  if (existente) {
    return NextResponse.json({ ok: true, idempotente: true })
  }

  const clickIdCookie = req.cookies.get('scal_attribution')?.value
  const clickIdUrl = String(payload.scal_click ?? '')
  const clickId = clickIdCookie || clickIdUrl || null

  let parceiroId: string | null = null
  if (clickId) {
    const { data: clique } = await adminClient
      .from('cliques')
      .select('link_id, links(parceiro_id)')
      .eq('click_id', clickId)
      .maybeSingle()
    if (clique?.links) {
      parceiroId = (clique.links as { parceiro_id: string }).parceiro_id
    }
  }

  const statusConversao = ['cancelado', 'estornado', 'refunded', 'cancelled'].includes(statusPedido)
    ? 'cancelada'
    : 'confirmada'

  await adminClient.from('conversoes').insert({
    cliente_id,
    click_id: clickId,
    parceiro_id: parceiroId,
    pedido_externo_id: pedidoId,
    valor_venda: valorVenda,
    status: statusConversao,
    webhook_payload_raw: payload,
  })

  if (statusConversao === 'confirmada') {
    await adminClient.rpc('incrementar_faturamento', {
      p_cliente_id: cliente_id,
      p_valor: valorVenda,
    })
  }

  await adminClient.from('eventos').insert({
    tipo: statusConversao === 'confirmada' ? 'conversao_confirmada' : 'estorno',
    payload_json: { pedido_id: pedidoId, valor: valorVenda, parceiro_id: parceiroId },
    ator_tipo: 'sistema',
    ator_id: cliente_id,
  })

  return NextResponse.json({ ok: true })
}
