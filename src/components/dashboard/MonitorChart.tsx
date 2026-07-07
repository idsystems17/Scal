'use client'

import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface MonitorChartProps {
  data: {
    labels: string[]
    sucesso: number[]
    erros: number[]
  }
}

export function MonitorChart({ data }: MonitorChartProps) {
  const chartData = data.labels.map((label, i) => ({
    label,
    sucesso: data.sucesso[i],
    erros: data.erros[i],
  }))

  return (
    <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Monitor de redirecionamentos</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Últimas 24h — sucesso vs. erros</p>
      </div>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#cdd0d4" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: 8, border: '1px solid #c4c9d0', fontSize: 12 }}
            formatter={(value, name) => [(value ?? 0).toLocaleString('pt-BR'), name === 'sucesso' ? 'Sucesso' : 'Erros']}
          />
          <Line type="monotone" dataKey="sucesso" stroke="#2563eb" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="erros" stroke="#e11d48" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 16, marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 3, background: '#2563eb', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Sucesso</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <div style={{ width: 10, height: 3, background: '#e11d48', borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: '#64748b' }}>Erros</span>
        </div>
      </div>
    </div>
  )
}
