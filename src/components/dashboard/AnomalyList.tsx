interface Anomalia {
  descricao: string
  tempo: string
  loja: string
}

interface AnomalyListProps {
  anomalias: Anomalia[]
}

export function AnomalyList({ anomalias }: AnomalyListProps) {
  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Detecção de anomalias</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Atividades suspeitas detectadas</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {anomalias.map((a, i) => (
          <div
            key={i}
            style={{
              padding: '12px 14px',
              borderRadius: 10,
              background: '#fff5f6',
              border: '1px solid #ffe0e5',
              display: 'flex',
              gap: 10,
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#e11d48', marginTop: 5, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 12, color: '#475569', margin: 0, lineHeight: 1.5 }}>{a.descricao}</p>
              <div style={{ display: 'flex', gap: 12, marginTop: 6 }}>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>{a.tempo}</span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>• {a.loja}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
