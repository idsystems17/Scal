import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR')

const CANAL_COLORS: Record<string, string> = {
  Instagram: '#e11d48',
  WhatsApp: '#16a34a',
  YouTube: '#dc2626',
  TikTok: '#0B081A',
  Facebook: '#2563eb',
  Twitter: '#0ea5e9',
  Telegram: '#0284c7',
  Direto: '#9B6AFF',
}

function canalColor(canal: string) {
  return CANAL_COLORS[canal] ?? '#64748b'
}

export default async function CanaisPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 30)
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

  // Busca links com canal + cliques + conversões no período
  const { data: links } = await supabase
    .from('links')
    .select('id, canal, codigo')
    .eq('cliente_id', clienteRow.id)

  if (!links || links.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Canais</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Performance por canal de divulgação — últimos {days} dias</p>
        </div>
        <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '48px', textAlign: 'center', color: '#94a3b8' }}>
          <p style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Nenhum canal ainda</p>
          <p style={{ fontSize: 13, margin: '8px 0 0' }}>Os canais aparecem quando parceiros gerarem links de divulgação.</p>
        </div>
      </div>
    )
  }

  const linkIds = links.map(l => l.id)

  const [{ data: cliques }, { data: conversoes }] = await Promise.all([
    supabase
      .from('cliques')
      .select('link_id')
      .in('link_id', linkIds)
      .gte('criado_em', since),
    supabase
      .from('conversoes')
      .select('valor_venda, click_id, status')
      .eq('cliente_id', clienteRow.id)
      .eq('status', 'confirmada')
      .gte('criado_em', since),
  ])

  // Montar mapa link_id → contagem de cliques
  const cliquesPorLink: Record<string, number> = {}
  linkIds.forEach(id => { cliquesPorLink[id] = 0 })
  cliques?.forEach(c => { cliquesPorLink[c.link_id] = (cliquesPorLink[c.link_id] ?? 0) + 1 })

  // Para conversões, precisamos do click_id → link_id
  const { data: cliquesComId } = await supabase
    .from('cliques')
    .select('click_id, link_id')
    .in('link_id', linkIds)
    .gte('criado_em', since)

  const clickToLink: Record<string, string> = {}
  cliquesComId?.forEach(c => { if (c.click_id) clickToLink[c.click_id] = c.link_id })

  // Agregar por canal
  type CanalStats = { canal: string; cliques: number; conversoes: number; volume: number }
  const canalMap: Record<string, CanalStats> = {}

  links.forEach(l => {
    const canal = l.canal ?? 'Direto'
    if (!canalMap[canal]) canalMap[canal] = { canal, cliques: 0, conversoes: 0, volume: 0 }
    canalMap[canal].cliques += cliquesPorLink[l.id] ?? 0
  })

  conversoes?.forEach(c => {
    const linkId = c.click_id ? clickToLink[c.click_id] : null
    const link = links.find(l => l.id === linkId)
    const canal = link?.canal ?? 'Direto'
    if (!canalMap[canal]) canalMap[canal] = { canal, cliques: 0, conversoes: 0, volume: 0 }
    canalMap[canal].conversoes++
    canalMap[canal].volume += Number(c.valor_venda ?? 0)
  })

  const canais = Object.values(canalMap).sort((a, b) => b.volume - a.volume)
  const totalVolume = canais.reduce((s, c) => s + c.volume, 0)
  const totalCliques = canais.reduce((s, c) => s + c.cliques, 0)
  const totalConversoes = canais.reduce((s, c) => s + c.conversoes, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Canais</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Performance por canal de divulgação — últimos {days} dias</p>
      </div>

      {/* KPIs resumo */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Volume total', value: brl.format(totalVolume), sub: 'todos os canais' },
          { label: 'Cliques totais', value: num.format(totalCliques), sub: 'redirecionamentos' },
          { label: 'Conversões', value: num.format(totalConversoes), sub: 'vendas confirmadas' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: '#0B081A', margin: 0 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Tabela de canais */}
      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Detalhamento por canal</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{canais.length} canal{canais.length !== 1 ? 'is' : ''} ativo{canais.length !== 1 ? 's' : ''}</p>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #cdd0d4' }}>
              {['CANAL', 'CLIQUES', 'CONVERSÕES', 'VOLUME', 'CTR', 'PARTICIPAÇÃO'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {canais.map((c) => {
              const ctr = c.cliques > 0 ? (c.conversoes / c.cliques * 100) : 0
              const pct = totalVolume > 0 ? (c.volume / totalVolume * 100) : 0
              const color = canalColor(c.canal)
              return (
                <tr key={c.canal} style={{ borderBottom: '1px solid #f8fafc' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#0B081A' }}>{c.canal}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontSize: 13, color: '#475569' }}>{num.format(c.cliques)}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 600, color: '#0B081A' }}>{num.format(c.conversoes)}</td>
                  <td style={{ padding: '14px 12px', fontSize: 13, fontWeight: 700, color: '#0B081A' }}>{brl.format(c.volume)}</td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      fontSize: 12, fontWeight: 600, padding: '3px 8px', borderRadius: 6,
                      background: ctr >= 2 ? '#ecfdf3' : '#f1f5f9',
                      color: ctr >= 2 ? '#16a34a' : '#64748b',
                    }}>
                      {ctr.toFixed(1).replace('.', ',')}%
                    </span>
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#f1f5f9', overflow: 'hidden' }}>
                        <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }} />
                      </div>
                      <span style={{ fontSize: 12, color: '#64748b', minWidth: 36, textAlign: 'right' }}>{pct.toFixed(0)}%</span>
                    </div>
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
