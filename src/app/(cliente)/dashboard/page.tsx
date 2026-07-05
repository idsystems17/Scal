import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClienteDashboard } from '@/lib/actions/cliente'
import { ClienteDashboardClient } from './ClienteDashboardClient'

const CANAL_COLORS = ['#6366f1', '#2563eb', '#16a34a', '#db2777', '#f59e0b', '#64748b']

async function getReceitaPorCanal(clienteId: string, supabase: Awaited<ReturnType<typeof createClient>>, days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const { data: convs } = await supabase
    .from('conversoes')
    .select('valor_venda, click_id')
    .eq('cliente_id', clienteId)
    .eq('status', 'confirmada')
    .gte('criado_em', since)

  if (!convs || convs.length === 0) return []

  const clickIds = convs.map(c => c.click_id).filter(Boolean) as string[]
  if (clickIds.length === 0) {
    return [{ label: 'Direto', pct: 100, color: CANAL_COLORS[0] }]
  }

  const { data: cliques } = await supabase
    .from('cliques')
    .select('click_id, link_id')
    .in('click_id', clickIds.slice(0, 500))

  const linkIds = [...new Set((cliques ?? []).map(c => c.link_id))] as string[]
  const { data: links } = await supabase
    .from('links')
    .select('id, canal')
    .in('id', linkIds)

  const linkCanal: Record<string, string> = {}
  links?.forEach(l => { linkCanal[l.id] = l.canal ?? 'Direto' })

  const cliqueCanal: Record<string, string> = {}
  cliques?.forEach(c => { if (c.click_id) cliqueCanal[c.click_id] = linkCanal[c.link_id] ?? 'Direto' })

  const totalPorCanal: Record<string, number> = {}
  let totalGeral = 0
  convs.forEach(c => {
    const canal = c.click_id ? (cliqueCanal[c.click_id] ?? 'Direto') : 'Direto'
    const valor = Number(c.valor_venda ?? 0)
    totalPorCanal[canal] = (totalPorCanal[canal] ?? 0) + valor
    totalGeral += valor
  })

  if (totalGeral === 0) return []

  return Object.entries(totalPorCanal)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([label, total], i) => ({
      label,
      pct: Math.round(total / totalGeral * 100),
      color: CANAL_COLORS[i % CANAL_COLORS.length],
    }))
}

export default async function ClientePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 30)
  const q = sp.q ?? ''

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Conta não configurada</p>
          <p style={{ fontSize: 14 }}>Entre em contato com o suporte SCAL.</p>
        </div>
      </div>
    )
  }

  const [{ cliente, parceiros, alertas }, canalReceita] = await Promise.all([
    getClienteDashboard(clienteRow.id),
    getReceitaPorCanal(clienteRow.id, supabase, days),
  ])

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const webhookUrl = `${appUrl}/webhook/${clienteRow.id}`

  return (
    <ClienteDashboardClient
      clienteId={clienteRow.id}
      webhookUrl={webhookUrl}
      cliente={cliente}
      parceiros={parceiros ?? []}
      alertas={alertas ?? []}
      canalReceita={canalReceita}
      searchQuery={q}
    />
  )
}
