'use client'

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'

interface TrendChartProps {
  data: {
    labels: string[]
    cliques: number[]
    vendas: number[]
  }
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{value: number; name: string; color: string}>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 10, padding: '10px 14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <p style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>Dia {label}</p>
        {payload.map((entry) => (
          <p key={entry.name} style={{ fontSize: 13, fontWeight: 600, color: entry.color, margin: '2px 0' }}>
            {entry.name === 'cliques' ? 'Cliques' : 'Vendas'}: {entry.value.toLocaleString('pt-BR')}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function TrendChart({ data }: TrendChartProps) {
  const chartData = data.labels.map((label, i) => ({
    label,
    cliques: data.cliques[i],
    vendas: data.vendas[i],
  }))

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Tendência de desempenho</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Evolução de cliques e conversões</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip content={<CustomTooltip />} />
          <Line yAxisId="left" type="monotone" dataKey="cliques" stroke="#2563eb" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#2563eb' }} />
          <Line yAxisId="right" type="monotone" dataKey="vendas" stroke="#14b8a6" strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: '#14b8a6' }} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 3, background: '#2563eb', borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Cliques</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 12, height: 3, background: '#14b8a6', borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: '#64748b' }}>Vendas</span>
        </div>
      </div>
    </div>
  )
}
