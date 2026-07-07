import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Pagination } from '@/components/dashboard/Pagination'

const PAGE_SIZE = 20
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 })

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function ComissoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 30)
  const page = Math.max(1, Number(sp.page ?? 1))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id, nome')
    .eq('user_id', user.id)
    .single()

  if (!parceiro) redirect('/minha-area')

  const { data: todasNoPeriodo } = await supabase
    .from('conversoes')
    .select('valor_venda, status')
    .eq('parceiro_id', parceiro.id)
    .gte('criado_em', since)

  const confirmadas = (todasNoPeriodo ?? []).filter(c => c.status === 'confirmada')
  const totalVolume = confirmadas.reduce((s, c) => s + Number(c.valor_venda), 0)
  const totalConversoes = confirmadas.length
  const ticketMedio = totalConversoes > 0 ? totalVolume / totalConversoes : 0

  const { data: conversoes, count } = await supabase
    .from('conversoes')
    .select('id, valor_venda, status, pedido_externo_id, criado_em', { count: 'exact' })
    .eq('parceiro_id', parceiro.id)
    .gte('criado_em', since)
    .order('criado_em', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  const kpis = [
    { label: 'Volume gerado', value: brl.format(totalVolume), sub: `últimos ${days} dias`, color: '#9B6AFF' },
    { label: 'Vendas confirmadas', value: String(totalConversoes), sub: 'atribuídas a você', color: '#2563eb' },
    { label: 'Ticket médio', value: brl.format(ticketMedio), sub: 'por venda', color: '#16a34a' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Comissões</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Volume de vendas gerado pelos seus links — últimos {days} dias</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {kpis.map((k, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ fontSize: 26, fontWeight: 800, color: k.color, margin: 0, letterSpacing: '-0.5px' }}>{k.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Banner informativo */}
      <div style={{ padding: '16px 20px', borderRadius: 12, background: '#eff6ff', border: '1px solid #bfdbfe', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
        <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
          <span style={{ color: 'white', fontSize: 12, fontWeight: 700 }}>i</span>
        </div>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: '#1d4ed8', margin: 0 }}>Como funcionam as comissões no SCAL</p>
          <p style={{ fontSize: 13, color: '#3b82f6', margin: '4px 0 0', lineHeight: 1.5 }}>
            O SCAL rastreia o volume de vendas gerado pelos seus links. O valor da sua comissão (%) é combinado diretamente com o e-commerce — entre em contato com ele para saber o percentual acordado.
          </p>
        </div>
      </div>

      {/* Tabela de vendas */}
      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Histórico de vendas atribuídas</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{confirmadas.length} venda{confirmadas.length !== 1 ? 's' : ''} confirmada{confirmadas.length !== 1 ? 's' : ''} no período</p>
        </div>

        {confirmadas.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nenhuma venda neste período</p>
            <p style={{ fontSize: 13, margin: '6px 0 0' }}>Compartilhe seus links para gerar vendas.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cdd0d4' }}>
                {['DATA', 'PEDIDO', 'VALOR', 'STATUS'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {conversoes?.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 12px', fontSize: 12, color: '#64748b' }}>{tempoRelativo(c.criado_em)}</td>
                  <td style={{ padding: '14px 12px', fontFamily: 'monospace', fontSize: 12, color: '#64748b' }}>{c.pedido_externo_id}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0B081A' }}>{brl.format(Number(c.valor_venda))}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
                      background: c.status === 'confirmada' ? '#d1fae5' : '#ffe4e6',
                      color: c.status === 'confirmada' ? '#16a34a' : '#e11d48',
                    }}>
                      {c.status === 'confirmada' ? 'Confirmada' : 'Cancelada'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
