const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  top: { bg: '#eef4ff', color: '#1d4ed8', label: 'Top performer' },
  ativo: { bg: '#ecfdf3', color: '#16a34a', label: 'Ativo' },
  baixa_conversao: { bg: '#fff1f3', color: '#e11d48', label: 'Baixa conversão' },
  inativo: { bg: '#f1f4f9', color: '#64748b', label: 'Inativo há 15 dias' },
}

interface Partner {
  nome: string
  codigo: string
  clicks: number
  sales: number
  revenue: number
  status: 'top' | 'ativo' | 'baixa_conversao' | 'inativo'
}

interface PartnersTableProps {
  parceiros: Partner[]
}

function initials(name: string) {
  return name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

export function PartnersTable({ parceiros }: PartnersTableProps) {
  const fmt = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>Análise de parceiros</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Desempenho detalhado de todos os afiliados</p>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
              {['PARCEIRO', 'CÓDIGO', 'CLIQUES', 'VENDAS', 'FATURADO', 'STATUS'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {parceiros.map((p, i) => {
              const s = statusConfig[p.status]
              return (
                <tr key={i} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb, #1e40af)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'white', flexShrink: 0 }}>
                        {initials(p.nome)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a' }}>{p.nome}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#64748b', background: '#f8fafc', padding: '3px 8px', borderRadius: 6 }}>
                      {p.codigo}
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: '#475569' }}>
                    {p.clicks.toLocaleString('pt-BR')}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0f172a' }}>
                    {p.sales}
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
                    {fmt.format(p.revenue)}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600, background: s.bg, color: s.color }}>
                      {s.label}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
