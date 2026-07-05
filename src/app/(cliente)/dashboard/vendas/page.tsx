import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function VendasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) redirect('/dashboard')

  const { data: conversoes } = await supabase
    .from('conversoes')
    .select('id, valor_venda, status, pedido_externo_id, criado_em, parceiros(nome)')
    .eq('cliente_id', clienteRow.id)
    .order('criado_em', { ascending: false })
    .limit(200)

  const total = conversoes?.filter(c => c.status === 'confirmada').reduce((s, c) => s + Number(c.valor_venda), 0) ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Vendas</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Histórico de vendas rastreadas pelo SCAL</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Total confirmado</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: '2px 0 0' }}>{brl.format(total)}</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {!conversoes || conversoes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Nenhuma venda ainda</p>
            <p style={{ fontSize: 13, margin: '8px 0 0' }}>As vendas rastreadas via SCAL aparecerão aqui após o webhook ser configurado.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                {['PEDIDO', 'PARCEIRO', 'VALOR', 'STATUS', 'DATA'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conversoes.map(c => {
                const parceiro = (Array.isArray(c.parceiros) ? c.parceiros[0] : c.parceiros) as { nome: string } | null
                return (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{c.pedido_externo_id}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, color: '#475569' }}>{parceiro?.nome ?? '—'}</td>
                    <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{brl.format(Number(c.valor_venda))}</td>
                    <td style={{ padding: '14px 12px' }}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                        background: c.status === 'confirmada' ? '#ecfdf3' : '#fff1f3',
                        color: c.status === 'confirmada' ? '#16a34a' : '#e11d48',
                      }}>
                        {c.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 12px', fontSize: 12, color: '#64748b' }}>{tempoRelativo(c.criado_em)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
