interface RankingItem {
  nome: string
  codigo: string
  vendas: number
  total_faturado: number
  pct: number
}

interface BarRankingProps {
  items: RankingItem[]
  titulo?: string
  subtitulo?: string
}

export function BarRanking({ items, titulo = 'Top parceiros', subtitulo = 'Ranking por faturamento gerado' }: BarRankingProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  function initials(name: string) {
    return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>{titulo}</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{subtitulo}</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {items.map((item, i) => (
          <div key={i}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: i === 0 ? '#fde68a' : '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === 0 ? '#d97706' : '#64748b', flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                {initials(item.nome)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0B081A', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{item.nome}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0', fontFamily: 'monospace' }}>{item.codigo}</p>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: '#0B081A', margin: 0 }}>{fmt.format(item.total_faturado)}</p>
                <p style={{ fontSize: 11, color: '#94a3b8', margin: '2px 0 0' }}>{item.vendas} vendas</p>
              </div>
            </div>
            <div style={{ height: 6, background: '#f1f5f9', borderRadius: 10, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${item.pct}%`,
                  background: 'linear-gradient(90deg, #2563eb, #0ea5e9)',
                  borderRadius: 10,
                  transition: 'width 0.5s ease',
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
