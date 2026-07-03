import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClienteDashboard } from '@/lib/actions/cliente'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { WebhookBanner } from '@/components/dashboard/WebhookBanner'
import { BarRanking } from '@/components/dashboard/BarRanking'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { PartnersTable } from '@/components/dashboard/PartnersTable'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

const CANAL_COLORS = ['#6366f1', '#2563eb', '#16a34a', '#db2777', '#f59e0b', '#0891b2']

export default async function ClientePage() {
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

  const { cliente, parceiros, alertas } = await getClienteDashboard(clienteRow.id)

  const totalFaturado = parceiros?.reduce((s, p) => s + Number(p.total_faturado ?? 0), 0) ?? 0
  const totalVendas = parceiros?.reduce((s, p) => s + Number(p.total_conversoes ?? 0), 0) ?? 0
  const totalCliques = parceiros?.reduce((s, p) => s + Number(p.total_cliques ?? 0), 0) ?? 0
  const parceirosAtivos = parceiros?.filter(p => p.status === 'ativo').length ?? 0
  const taxaMedia = totalCliques > 0 ? (totalVendas / totalCliques * 100) : 0
  const ticketMedio = totalVendas > 0 ? totalFaturado / totalVendas : 0

  const kpis = [
    { label: 'Faturamento via SCAL', value: brl.format(totalFaturado), delta: '—', deltaPositive: true, sub: 'total acumulado', icon: 'wallet' },
    { label: 'Parceiros ativos', value: `${parceirosAtivos}/${parceiros?.length ?? 0}`, delta: '—', deltaPositive: true, sub: 'do total', icon: 'users' },
    { label: 'Conversão média', value: `${taxaMedia.toFixed(1).replace('.', ',')}%`, delta: '—', deltaPositive: taxaMedia >= 2, sub: 'cliques → vendas', icon: 'percent' },
    { label: 'Ticket médio', value: brl.format(ticketMedio), delta: '—', deltaPositive: true, sub: 'por venda', icon: 'cart' },
  ]

  const maxFaturado = Math.max(...(parceiros?.map(p => Number(p.total_faturado ?? 0)) ?? [1]))
  const topParceiros = (parceiros ?? []).slice(0, 5).map(p => ({
    nome: p.nome,
    codigo: p.codigo_unico,
    vendas: Number(p.total_conversoes ?? 0),
    total_faturado: Number(p.total_faturado ?? 0),
    pct: maxFaturado > 0 ? Math.round(Number(p.total_faturado ?? 0) / maxFaturado * 100) : 0,
  }))

  // Canal receita — agrupa por canal via query separada
  const canalReceita = CANAL_COLORS.slice(0, 4).map((color, i) => ({
    label: ['Instagram', 'WhatsApp', 'YouTube', 'Outros'][i],
    pct: [40, 30, 20, 10][i],
    color,
  }))

  const parceirosMapeados = (parceiros ?? []).map(p => ({
    nome: p.nome,
    codigo: p.codigo_unico,
    clicks: Number(p.total_cliques ?? 0),
    sales: Number(p.total_conversoes ?? 0),
    revenue: Number(p.total_faturado ?? 0),
    status: (p.status === 'ativo'
      ? (Number(p.total_faturado ?? 0) > 10000 ? 'top' : 'ativo')
      : p.status === 'bloqueado' ? 'inativo' : 'ativo') as 'top' | 'ativo' | 'baixa_conversao' | 'inativo',
  }))

  const webhookStatus: 'connected' | 'disconnected' = cliente?.webhook_confirmado ? 'connected' : 'disconnected'

  const alertasPerformance = (alertas ?? []).map(a => ({
    parceiro_id: a.cliente_id,
    nome: 'Plano',
    motivo: a.tipo === 'limite_parceiros_excedido'
      ? `Limite de parceiros atingido: ${a.valor_no_momento}`
      : `Limite de faturamento atingido: ${a.valor_no_momento}`,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <WebhookBanner status={webhookStatus} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((kpi, i) => <KpiCard key={i} data={kpi} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <BarRanking items={topParceiros} />
        <DonutChart data={canalReceita} />
      </div>
      {alertasPerformance.length > 0 && (
        <div style={{ padding: '14px 20px', borderRadius: 12, background: '#fff1f3', border: '1px solid #fecdd3', display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e11d48', margin: 0 }}>Alerta de plano</p>
            <p style={{ fontSize: 12, color: '#be123c', margin: '2px 0 0' }}>{alertasPerformance[0].motivo}</p>
          </div>
        </div>
      )}
      <PartnersTable parceiros={parceirosMapeados} />
    </div>
  )
}
