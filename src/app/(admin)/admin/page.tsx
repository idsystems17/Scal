import { MOCK_ADMIN } from '@/lib/mock-data'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'
import { MonitorChart } from '@/components/dashboard/MonitorChart'
import { AnomalyList } from '@/components/dashboard/AnomalyList'
import { TenantsTable } from '@/components/dashboard/TenantsTable'

export default function AdminPage() {
  const data = MOCK_ADMIN

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Status bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          padding: '12px 20px',
          borderRadius: 12,
          background: 'white',
          border: '1px solid #e6ecf5',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: '#16a34a',
              boxShadow: '0 0 0 3px #dcfce7',
              animation: 'pulse 2s infinite',
            }}
          />
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 500 }}>
            Infraestrutura operacional · Supabase + Vercel
          </span>
        </div>
        <span style={{ color: '#e2e8f0' }}>|</span>
        <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: 8, padding: 3, gap: 2 }}>
          {['Padrão', 'Central de operações'].map((label, i) => (
            <button
              key={label}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: 'none',
                background: i === 0 ? 'white' : 'transparent',
                color: i === 0 ? '#0f172a' : '#94a3b8',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                boxShadow: i === 0 ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {data.kpis.map((kpi, i) => (
          <KpiCard key={i} data={kpi} />
        ))}
      </div>

      {/* Alertas + Monitor + Anomalias */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.25fr 1fr', gap: 16, alignItems: 'start' }}>
        <AlertsPanel alertas={data.alertas_plano} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <MonitorChart data={data.monitorData} />
          <AnomalyList anomalias={data.anomalias} />
        </div>
      </div>

      {/* Tenants Table */}
      <TenantsTable tenants={data.tenants} />

    </div>
  )
}
