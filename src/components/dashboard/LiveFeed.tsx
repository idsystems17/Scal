interface LiveFeedItem {
  value: string
  channel: string
  time: string
  color: string
}

interface LiveFeedProps {
  items: LiveFeedItem[]
}

export function LiveFeed({ items }: LiveFeedProps) {
  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)', height: '100%' }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', boxShadow: '0 0 0 3px #dcfce7', animation: 'pulse 2s infinite' }} />
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Últimas atribuições</h3>
        </div>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0 16px' }}>Vendas em tempo real</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 12px',
              background: '#f8fafc',
              borderRadius: 10,
            }}
          >
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: item.color, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#0B081A', margin: 0 }}>
                Venda de {item.value}
              </p>
              <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>
                via {item.channel}
              </p>
            </div>
            <span style={{ fontSize: 11, color: '#cbd5e1', whiteSpace: 'nowrap' }}>{item.time}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
