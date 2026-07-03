import { getAdminDashboard } from '@/lib/actions/admin'
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

export default async function AdminPage() {
  const { tenants, alertas, anomalias } = await getAdminDashboard()

  const totalFaturamento = tenants?.reduce((s, t) => s + Number(t.faturamento_acumulado_scal ?? 0), 0) ?? 0
  const totalParceiros = tenants?.reduce((s, t) => s + Number(t.parceiros_ativos_contagem ?? 0), 0) ?? 0
  const totalAlertas = alertas?.length ?? 0
  const totalTenants = tenants?.length ?? 0

  const kpis = [
    { label: 'Lojas ativas', value: num.format(totalTenants), delta: '—', deltaPositive: true, sub: 'clientes SCAL', icon: 'server' },
    { label: 'Parceiros totais', value: num.format(totalParceiros), delta: '—', deltaPositive: true, sub: 'em todas as lojas', icon: 'users' },
    { label: 'Faturamento total', value: brl.format(totalFaturamento), delta: '—', deltaPositive: true, sub: 'via SCAL', icon: 'wallet' },
    { label: 'Alertas abertos', value: num.format(totalAlertas), delta: '—', deltaPositive: totalAlertas === 0, sub: 'pendentes', icon: 'alert' },
  ]

  const alertasMapeados = (alertas ?? []).map(a => ({
    id: a.id,
    cliente_nome: (a.clientes as { nome_loja: string } | null)?.nome_loja ?? 'Loja',
    tipo: a.tipo === 'limite_parceiros_excedido' ? 'limite_parceiros' : 'limite_faturamento' as 'limite_parceiros' | 'limite_faturamento',
    valor_atual: a.valor_no_momento ?? '—',
    limite: a.tipo === 'limite_parceiros_excedido' ? '20 parceiros' : 'R$ 100.000',
    resolvido: a.resolvido,
  }))

  const tenantsMapeados = (tenants ?? []).map(t => ({
    id: String(t.cliente_id ?? ''),
    nome: t.nome_loja ?? 'Loja',
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

  const monitorData = {
    labels: ['00h', '04h', '08h', '12h', '16h', '20h', 'Agora'],
    sucesso: [12, 18, 24, 31, 28, 22, 15],
    erros: [0, 1, 0, 2, 1, 0, 0],
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 20px', borderRadius: 12, background: 'white', border: '1px solid #e6ecf5' }}>
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
      <TenantsTable tenants={tenantsMapeados} />
    </div>
  )
}
