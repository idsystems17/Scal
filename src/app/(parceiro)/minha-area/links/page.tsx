import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getParceiroDashboard } from '@/lib/actions/parceiro'
import { ChannelTable } from '@/components/dashboard/ChannelTable'

export default async function MeusLinksPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id, cliente_id')
    .eq('user_id', user.id)
    .single()

  if (!parceiro) redirect('/minha-area')

  const [{ canais }, clienteResult] = await Promise.all([
    getParceiroDashboard(parceiro.id),
    supabase.from('clientes').select('url_loja').eq('id', parceiro.cliente_id).maybeSingle(),
  ])
  const urlLoja = clienteResult.data?.url_loja ?? ''

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const channels = canais.map(c => ({
    name: c.canal ?? 'Direto',
    abbr: (c.canal ?? 'DI').slice(0, 2).toUpperCase(),
    url: `${appUrl}/r/${c.codigo}`,
    clicks: Number(c.total_cliques ?? 0),
    conversoes: Number(c.total_conversoes ?? 0),
    ctr: `${Number(c.ctr_pct ?? 0).toFixed(2).replace('.', ',')}%`,
    ctrValue: Number(c.ctr_pct ?? 0),
    ctrPositive: Number(c.ctr_pct ?? 0) >= 2,
    volume: new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 }).format(Number(c.volume_vendas ?? 0)),
    volumeValue: Number(c.volume_vendas ?? 0),
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Meus links</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Gerencie seus links de afiliado por canal</p>
      </div>
      <ChannelTable channels={channels} parceiroId={parceiro.id} clienteId={parceiro.cliente_id} urlLojaDefault={urlLoja} />
    </div>
  )
}
