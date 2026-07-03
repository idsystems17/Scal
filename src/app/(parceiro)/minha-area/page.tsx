import { MOCK_PARCEIRO } from '@/lib/mock-data'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { TrendChart } from '@/components/dashboard/TrendChart'
import { LiveFeed } from '@/components/dashboard/LiveFeed'
import { ChannelTable } from '@/components/dashboard/ChannelTable'

export default function ParceiroPage() {
  const data = MOCK_PARCEIRO

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {data.kpis.map((kpi, i) => (
          <KpiCard key={i} data={kpi} />
        ))}
      </div>

      {/* Trend + Live Feed */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.85fr 1fr', gap: 16 }}>
        <TrendChart data={data.trendData} />
        <LiveFeed items={data.liveFeed} />
      </div>

      {/* Channel Table */}
      <ChannelTable channels={data.channels} />

    </div>
  )
}
