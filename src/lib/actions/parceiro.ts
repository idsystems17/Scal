'use server'
import { createClient } from '@/lib/supabase/server'

function cutoff(days: number) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
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
