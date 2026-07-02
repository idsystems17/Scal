import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createHmac } from 'crypto'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ cliente_id: string }> }
) {
  const { cliente_id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, webhook_secret')
    .eq('id', cliente_id)
    .eq('user_id', user.id)
    .single()

  if (!cliente) return NextResponse.json({ error: 'forbidden' }, { status: 403 })

  const payload = JSON.stringify({
    pedido_id: `TEST-${Date.now()}`,
    valor: 99.90,
    status: 'confirmado',
  })

  const signature = createHmac('sha256', cliente.webhook_secret)
    .update(payload, 'utf8')
    .digest('hex')

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const res = await fetch(`${appUrl}/webhook/${cliente_id}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-scal-signature': signature },
    body: payload,
  })

  return NextResponse.json({ ok: res.ok, status: res.status })
}
