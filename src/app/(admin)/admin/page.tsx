import { getAdminDashboard, getMonitorData, getAdminKpiDeltas } from '@/lib/actions/admin'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { MonitorChart } from '@/components/dashboard/MonitorChart'
import { AnomalyList } from '@/components/dashboard/AnomalyList'
import { TenantsTable } from '@/components/dashboard/TenantsTable'

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

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const q = sp.q ?? ''
  const days = Number(sp.period ?? 30)

  const [{ tenants, alertas, anomalias }, monitorData, deltas] = await Promise.all([
    getAdminDashboard(),
    getMonitorData(),
    getAdminKpiDeltas(days),
  ])

  const totalFaturamento = tenants?.reduce((s, t) => s + Number(t.faturamento_acumulado_scal ?? 0), 0) ?? 0
  const totalParceiros = tenants?.reduce((s, t) => s + Number(t.parceiros_ativos_contagem ?? 0), 0) ?? 0
  const totalAlertas = alertas?.length ?? 0
  const totalTenants = tenants?.length ?? 0

  const kpis = [
    { label: 'E-commerces ativos', value: num.format(totalTenants), delta: deltas.empresas.label, deltaPositive: deltas.empresas.positive, sub: `e-commerces SCAL · vs ${days}d anteriores`, icon: 'server' },
    { label: 'Parceiros totais', value: num.format(totalParceiros), delta: deltas.parceiros.label, deltaPositive: deltas.parceiros.positive, sub: `em todos os e-commerces · vs ${days}d anteriores`, icon: 'users' },
    { label: 'Faturamento total', value: brl.format(totalFaturamento), delta: deltas.faturamento.label, deltaPositive: deltas.faturamento.positive, sub: `via SCAL · receita ${days}d`, icon: 'wallet' },
    { label: 'Alertas abertos', value: num.format(totalAlertas), delta: deltas.alertas.label, deltaPositive: deltas.alertas.positive, sub: `pendentes · abertos em ${days}d`, icon: 'alert' },
  ]

  const alertasMapeados = (alertas ?? []).map(a => ({
    id: a.id,
    cliente_nome: (a.clientes as { nome_loja: string } | null)?.nome_loja ?? 'E-commerce',
    tipo: a.tipo === 'limite_parceiros_excedido' ? 'limite_parceiros' : 'limite_faturamento' as 'limite_parceiros' | 'limite_faturamento',
    valor_atual: a.valor_no_momento ?? '—',
    limite: a.tipo === 'limite_parceiros_excedido' ? '20 parceiros' : 'R$ 50.000',
    resolvido: a.resolvido,
  }))

  const tenantsMapeados = (tenants ?? []).map(t => ({
    id: String(t.cliente_id ?? ''),
    nome: t.nome_loja ?? 'E-commerce',
    plataforma: t.plataforma_detectada ?? '—',
    parceiros: Number(t.parceiros_ativos_contagem ?? 0),
    limite_parceiros: Number(t.limite_parceiros_incluidos ?? 20),
    faturamento: Number(t.faturamento_acumulado_scal ?? 0),
    webhook_status: (t.webhook_confirmado ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
    status: (t.status ?? 'trial') as 'ativo' | 'suspenso' | 'trial' | 'cancelado',
  }))

  const anomaliasMapeadas = (anomalias ?? []).map(a => ({
    descricao: (a.payload_json as { motivo?: string } | null)?.motivo ?? 'Erro desconhecido',
    tempo: tempoRelativo(a.criado_em),
    loja: (a.payload_json as { cliente_id?: string } | null)?.cliente_id ?? '—',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderRadius: 12, background: 'white', border: '1px solid #dbe0e9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px #dcfce7' }} />
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>Infraestrutura operacional · Supabase + Vercel</span>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((kpi, i) => <KpiCard key={i} data={kpi} />)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16, alignItems: 'start' }}>
        <AlertsPanel alertas={alertasMapeados} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MonitorChart data={monitorData} />
          <AnomalyList anomalias={anomaliasMapeadas} />
        </div>
      </div>
      <TenantsTable tenants={tenantsMapeados} searchQuery={q} />
    </div>
  )
}
