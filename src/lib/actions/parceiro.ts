'use server'
import { createClient } from '@/lib/supabase/server'
import { calcDelta, periodWindows } from '@/lib/deltas'

function cutoff(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

export async function getParceiroKpiDeltas(parceiroId: string, days: number) {
  const supabase = await createClient()
  const { now, since, sincePrevious } = periodWindows(days)

  const { data: links } = await supabase.from('links').select('id').eq('parceiro_id', parceiroId)
  const linkIds = (links ?? []).map(l => l.id)

  const [
    cliquesAtual, cliquesAnterior,
    conversoesAtual, conversoesAnterior,
  ] = await Promise.all([
    linkIds.length > 0
      ? supabase.from('cliques').select('id', { count: 'exact', head: true }).in('link_id', linkIds).gte('criado_em', since).lt('criado_em', now)
      : Promise.resolve({ count: 0 }),
    linkIds.length > 0
      ? supabase.from('cliques').select('id', { count: 'exact', head: true }).in('link_id', linkIds).gte('criado_em', sincePrevious).lt('criado_em', since)
      : Promise.resolve({ count: 0 }),
    supabase.from('conversoes').select('valor_venda').eq('parceiro_id', parceiroId).eq('status', 'confirmada').gte('criado_em', since).lt('criado_em', now),
    supabase.from('conversoes').select('valor_venda').eq('parceiro_id', parceiroId).eq('status', 'confirmada').gte('criado_em', sincePrevious).lt('criado_em', since),
  ])

  const volumeAtual = (conversoesAtual.data ?? []).reduce((s, r) => s + Number(r.valor_venda ?? 0), 0)
  const volumeAnterior = (conversoesAnterior.data ?? []).reduce((s, r) => s + Number(r.valor_venda ?? 0), 0)
  const vendasAtual = conversoesAtual.data?.length ?? 0
  const vendasAnterior = conversoesAnterior.data?.length ?? 0
  const cliquesAtualCount = cliquesAtual.count ?? 0
  const cliquesAnteriorCount = cliquesAnterior.count ?? 0

  const taxaAtual = cliquesAtualCount > 0 ? (vendasAtual / cliquesAtualCount * 100) : 0
  const taxaAnterior = cliquesAnteriorCount > 0 ? (vendasAnterior / cliquesAnteriorCount * 100) : 0

  return {
    cliques: calcDelta(cliquesAtualCount, cliquesAnteriorCount),
    vendas: calcDelta(vendasAtual, vendasAnterior),
    volume: calcDelta(volumeAtual, volumeAnterior),
    taxaConversao: calcDelta(taxaAtual, taxaAnterior),
  }
}

export async function getParceiroDashboard(parceiroId: string, days = 30) {
  const supabase = await createClient()
  const since = cutoff(days)

  const [canais, tendencia, feed] = await Promise.all([
    supabase.from('vw_parceiro_dashboard').select('*').eq('parceiro_id', parceiroId),
    supabase
      .from('vw_parceiro_tendencia')
      .select('*')
      .eq('parceiro_id', parceiroId)
      .gte('dia', since.slice(0, 10)),
    supabase
      .from('conversoes')
      .select('valor_venda, criado_em')
      .eq('parceiro_id', parceiroId)
      .eq('status', 'confirmada')
      .gte('criado_em', since)
      .order('criado_em', { ascending: false })
      .limit(8),
  ])
  return { canais: canais.data ?? [], tendencia: tendencia.data ?? [], feed: feed.data ?? [] }
}

export async function getMateriaisParceiro() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('materiais')
    .select('id, titulo, url, criado_em, cliente_id')
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function gerarLink(parceiroId: string, clienteId: string, canal: string, destinoUrl: string) {
  const supabase = await createClient()
  const codigo = `${parceiroId.slice(0, 4)}-${Date.now().toString(36).toUpperCase()}`
  const { data, error } = await supabase.from('links').insert({
    parceiro_id: parceiroId,
    cliente_id: clienteId,
    codigo,
    destino_url: destinoUrl,
    canal,
  }).select('codigo').single()
  if (error) throw error
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  return `${appUrl}/r/${data.codigo}`
}
