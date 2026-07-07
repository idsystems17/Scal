import { KpiCard as KpiCardType } from '@/types/dashboard'
import { Icon } from './Icon'

const iconColorMap: Record<string, string> = {
  click: '#2563eb',
  cart: '#9B6AFF',
  wallet: '#0ea5e9',
  percent: '#f59e0b',
  mrr: '#2563eb',
  globe: '#9B6AFF',
  activity: '#14b8a6',
  alert: '#f97316',
}

interface KpiCardProps {
  data: KpiCardType
}

export function KpiCard({ data }: KpiCardProps) {
  const iconColor = iconColorMap[data.icon] || '#2563eb'

  return (
    <div
      style={{
        background: 'white',
        border: '1px solid #c4c9d0',
        borderRadius: 16,
        padding: '24px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: '#64748b', letterSpacing: '0.01em' }}>
          {data.label}
        </span>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: `${iconColor}18`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: iconColor,
          }}
        >
          <Icon name={data.icon} size={18} />
        </div>
      </div>

      <div style={{ fontSize: 28, fontWeight: 700, color: '#0B081A', lineHeight: 1 }}>
        {data.value}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
            padding: '2px 8px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 600,
            background: data.deltaPositive ? '#ecfdf3' : '#fff1f3',
            color: data.deltaPositive ? '#16a34a' : '#e11d48',
          }}
        >
          {data.deltaPositive ? '▲' : '▼'} {data.delta}
        </span>
        <span style={{ fontSize: 12, color: '#94a3b8' }}>{data.sub}</span>
      </div>
    </div>
  )
}
