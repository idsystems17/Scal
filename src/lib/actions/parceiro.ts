'use server'
import { createClient } from '@/lib/supabase/server'

export async function getParceiroDashboard(parceiroId: string) {
  const supabase = await createClient()
  const [canais, tendencia, feed] = await Promise.all([
    supabase
      .from('vw_parceiro_dashboard')
      .select('*')
      .eq('parceiro_id', parceiroId),
    supabase
      .from('vw_parceiro_tendencia')
      .select('*')
      .eq('parceiro_id', parceiroId),
    supabase
      .from('conversoes')
      .select('valor_venda, criado_em, links(canal)')
      .eq('parceiro_id', parceiroId)
      .eq('status', 'confirmada')
      .order('criado_em', { ascending: false })
      .limit(5),
  ])
  return { canais: canais.data, tendencia: tendencia.data, feed: feed.data }
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
  return `${process.env.NEXT_PUBLIC_APP_URL}/r/${data.codigo}`
}
