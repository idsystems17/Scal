import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { hashIP } from '@/lib/security/hash'
import { checkRateLimit } from '@/lib/security/ratelimit'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ codigo: string }> }
) {
  const { codigo } = await params
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  if (!(await checkRateLimit(`click:${hashIP(ip)}`, 60, 60_000))) {
    return NextResponse.json({ error: 'rate_limited' }, { status: 429 })
  }

  const { data: link } = await adminClient
    .from('links')
    .select('id, destino_url, cliente_id, ativo')
    .eq('codigo', codigo)
    .eq('ativo', true)
    .single()

  if (!link) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  const clickId = crypto.randomUUID()

  adminClient.from('cliques').insert({
    link_id: link.id,
    cliente_id: link.cliente_id,
    click_id: clickId,
    ip_hash: hashIP(ip),
    user_agent: req.headers.get('user-agent') ?? null,
    referrer: req.headers.get('referer') ?? null,
  }).then(() => {})

  const destino = new URL(link.destino_url)
  destino.searchParams.set('scal_click', clickId)

  const response = NextResponse.redirect(destino.toString(), { status: 302 })
  response.cookies.set('scal_attribution', clickId, {
    maxAge: 30 * 24 * 60 * 60,
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
  })

  return response
}
