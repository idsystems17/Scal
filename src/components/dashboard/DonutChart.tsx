'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DonutChartProps {
  data: Array<{
    label: string
    pct: number
    color: string
  }>
  titulo?: string
  subtitulo?: string
}

export function DonutChart({ data, titulo = 'Receita por canal', subtitulo = 'Distribuição de origem das vendas' }: DonutChartProps) {
  return (
    <div style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>{titulo}</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{subtitulo}</p>
      </div>

      {data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: 13, margin: 0 }}>Sem dados suficientes ainda.</p>
        </div>
      ) : (
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data.map(d => ({ name: d.label, value: d.pct }))}
                cx="50%"
                cy="50%"
                innerRadius={42}
                outerRadius={65}
                dataKey="value"
                strokeWidth={2}
                stroke="white"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => [`${value}%`, '']}
                contentStyle={{ borderRadius: 8, border: '1px solid #dbe0e9', fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: item.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#475569', flex: 1 }}>{item.label}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0B081A' }}>{item.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      )}
    </div>
  )
}
