import { MOCK_CLIENTE } from '@/lib/mock-data'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { WebhookBanner } from '@/components/dashboard/WebhookBanner'
import { BarRanking } from '@/components/dashboard/BarRanking'
import { DonutChart } from '@/components/dashboard/DonutChart'
import { PartnersTable } from '@/components/dashboard/PartnersTable'

const fmtBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const fmtNum = new Intl.NumberFormat('pt-BR')

export default function ClientePage() {
  const data = MOCK_CLIENTE
  const m = data.metrics

  const kpis = [
    {
      label: 'Faturamento via SCAL',
      value: fmtBRL.format(m.faturamento_total_scal),
      delta: '18,4%',
      deltaPositive: true,
      sub: 'vs. mês anterior',
      icon: 'wallet',
    },
    {
      label: 'Parceiros ativos',
      value: `${m.parceiros_ativos}/${m.parceiros_totais}`,
      delta: '5 novos',
      deltaPositive: true,
      sub: 'este mês',
      icon: 'users',
    },
    {
      label: 'Conversão média',
      value: `${m.taxa_conversao_media.toFixed(1).replace('.', ',')}%`,
      delta: '0,2 pp',
      deltaPositive: true,
      sub: 'vs. anterior',
      icon: 'percent',
    },
    {
      label: 'Ticket médio',
      value: fmtBRL.format(m.ticket_medio),
      delta: '3,1%',
      deltaPositive: false,
      sub: 'vs. anterior',
      icon: 'cart',
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Webhook Banner */}
      <WebhookBanner status={data.webhook_status} />

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {kpis.map((kpi, i) => (
          <KpiCard key={i} data={kpi} />
        ))}
      </div>

      {/* Ranking + Donut */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 16 }}>
        <BarRanking items={data.top_parceiros} />
        <DonutChart data={data.canal_receita} />
      </div>

      {/* Alerta de performance */}
      {data.alertas_performance.length > 0 && (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 12,
            background: '#fff1f3',
            border: '1px solid #fecdd3',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{ fontSize: 16 }}>⚠️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: '#e11d48', margin: 0 }}>
              Alerta de performance — {data.alertas_performance[0].nome}
            </p>
            <p style={{ fontSize: 12, color: '#be123c', margin: '2px 0 0' }}>
              {data.alertas_performance[0].motivo}
            </p>
          </div>
        </div>
      )}

      {/* Partners Table */}
      <PartnersTable parceiros={data.parceiros} />

    </div>
  )
}
