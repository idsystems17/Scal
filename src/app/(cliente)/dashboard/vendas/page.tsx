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

export default async function VendasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 30)
  const q = sp.q ?? ''
  const page = Math.max(1, Number(sp.page ?? 1))
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) redirect('/dashboard')

  let buscaOr = ''
  if (q) {
    const { data: parceirosMatch } = await supabase
      .from('parceiros')
      .select('id')
      .eq('cliente_id', clienteRow.id)
      .ilike('nome', `%${q}%`)
    const parceiroIds = (parceirosMatch ?? []).map(p => p.id)
    const termo = q.replace(/[,()]/g, '')
    const condicoes = [`pedido_externo_id.ilike.%${termo}%`]
    if (parceiroIds.length > 0) condicoes.push(`parceiro_id.in.(${parceiroIds.join(',')})`)
    buscaOr = condicoes.join(',')
  }

  let totalsQuery = supabase
    .from('conversoes')
    .select('valor_venda, status')
    .eq('cliente_id', clienteRow.id)
    .gte('criado_em', since)
  if (buscaOr) totalsQuery = totalsQuery.or(buscaOr)
  const { data: todasNoPeriodo } = await totalsQuery
  const total = (todasNoPeriodo ?? []).filter(c => c.status === 'confirmada').reduce((s, c) => s + Number(c.valor_venda), 0)

  let query = supabase
    .from('conversoes')
    .select('id, valor_venda, status, pedido_externo_id, criado_em, parceiros(nome)', { count: 'exact' })
    .eq('cliente_id', clienteRow.id)
    .gte('criado_em', since)
    .order('criado_em', { ascending: false })
    .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

  if (buscaOr) query = query.or(buscaOr)

  const { data: conversoes, count } = await query
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Vendas</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            Últimos {days} dias{q ? ` · busca: "${q}"` : ''}
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>Total confirmado</p>
          <p style={{ fontSize: 22, fontWeight: 700, color: '#0B081A', margin: '2px 0 0' }}>{brl.format(total)}</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        {!conversoes || conversoes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>
              {q ? `Nenhuma venda encontrada para "${q}"` : 'Nenhuma venda neste período'}
            </p>
            <p style={{ fontSize: 13, margin: '8px 0 0' }}>Tente ampliar o período ou alterar a busca.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #cdd0d4' }}>
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
                    <td style={{ padding: '14px 12px', fontSize: 12, color: '#64748b' }}>{tempoRelativo(c.criado_em)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
        <Pagination page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
