import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getParceiroDashboard } from '@/lib/actions/parceiro'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { LiveFeed } from '@/components/dashboard/LiveFeed'
import { ChannelTable } from '@/components/dashboard/ChannelTable'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR')

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

export default async function ParceiroPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 30)

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id, cliente_id')
    .eq('user_id', user.id)
    .single()

  if (!parceiro) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Conta não configurada</p>
          <p style={{ fontSize: 14 }}>Entre em contato com a empresa para ativar seu acesso.</p>
        </div>
      </div>
    )
  }

  const [{ canais, tendencia, feed }, clienteResult] = await Promise.all([
    getParceiroDashboard(parceiro.id, days),
    supabase.from('clientes').select('url_loja').eq('id', parceiro.cliente_id).single(),
  ])
  const urlLoja = clienteResult.data?.url_loja ?? ''

  const totalCliques = canais.reduce((s, c) => s + Number(c.total_cliques ?? 0), 0)
  const totalVendas = canais.reduce((s, c) => s + Number(c.total_conversoes ?? 0), 0)
  const totalVolume = canais.reduce((s, c) => s + Number(c.volume_vendas ?? 0), 0)
  const taxaConversao = totalCliques > 0 ? (totalVendas / totalCliques * 100) : 0

  const kpis = [
    { label: 'Cliques totais', value: num.format(totalCliques), delta: '—', deltaPositive: true, sub: 'todos os canais', icon: 'click' },
    { label: 'Vendas atribuídas', value: num.format(totalVendas), delta: '—', deltaPositive: true, sub: 'confirmadas', icon: 'cart' },
    { label: 'Volume de vendas', value: brl.format(totalVolume), delta: '—', deltaPositive: true, sub: 'receita total', icon: 'wallet' },
    { label: 'Taxa de conversão', value: `${taxaConversao.toFixed(2).replace('.', ',')}%`, delta: '—', deltaPositive: taxaConversao >= 2, sub: 'cliques → vendas', icon: 'percent' },
  ]

  const trendData = {
    labels: tendencia.map(t => new Date(t.dia).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })),
    cliques: tendencia.map(t => Number(t.cliques ?? 0)),
    vendas: tendencia.map(t => Number(t.vendas ?? 0)),
  }

  const liveFeed = feed.map(f => ({
    value: brl.format(Number(f.valor_venda ?? 0)),
    channel: 'Venda confirmada',
    time: tempoRelativo(f.criado_em),
    color: '#6366f1',
  }))

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const channels = canais.map(c => ({
    name: c.canal ?? 'Direto',
    abbr: (c.canal ?? 'DI').slice(0, 2).toUpperCase(),
    url: `${appUrl}/r/${c.codigo}`,
    clicks: Number(c.total_cliques ?? 0),
    conversoes: Number(c.total_conversoes ?? 0),
    ctr: `${Number(c.ctr_pct ?? 0).toFixed(2).replace('.', ',')}%`,
    ctrPositive: Number(c.ctr_pct ?? 0) >= 2,
    volume: brl.format(Number(c.volume_vendas ?? 0)),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((kpi, i) => <KpiCard key={i} data={kpi} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 16 }}>
        <TrendChart data={trendData} />
        <LiveFeed items={liveFeed} />
      </div>
      <ChannelTable channels={channels} parceiroId={parceiro.id} clienteId={parceiro.cliente_id} urlLojaDefault={urlLoja} />
    </div>
  )
}
