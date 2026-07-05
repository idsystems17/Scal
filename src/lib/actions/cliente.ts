'use server'
import { createClient } from '@/lib/supabase/server'
import { calcDelta, periodWindows } from '@/lib/deltas'
import { validarUrlMaterial } from '@/lib/validarUrlMaterial'

export async function getClienteKpiDeltas(clienteId: string, days: number) {
  const supabase = await createClient()
  const { now, since, sincePrevious } = periodWindows(days)

  const [
    parceirosBaseline, parceirosAtivosTotal,
    conversoesAtual, conversoesAnterior,
    cliquesAtual, cliquesAnterior,
  ] = await Promise.all([
    supabase.from('parceiros').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId).eq('status', 'ativo').lt('criado_em', since),
    supabase.from('parceiros').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId).eq('status', 'ativo'),
    supabase.from('conversoes').select('valor_venda').eq('cliente_id', clienteId).eq('status', 'confirmada').gte('criado_em', since).lt('criado_em', now),
    supabase.from('conversoes').select('valor_venda').eq('cliente_id', clienteId).eq('status', 'confirmada').gte('criado_em', sincePrevious).lt('criado_em', since),
    supabase.from('cliques').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId).gte('criado_em', since).lt('criado_em', now),
    supabase.from('cliques').select('id', { count: 'exact', head: true }).eq('cliente_id', clienteId).gte('criado_em', sincePrevious).lt('criado_em', since),
  ])

  const faturamentoAtual = (conversoesAtual.data ?? []).reduce((s, r) => s + Number(r.valor_venda ?? 0), 0)
  const faturamentoAnterior = (conversoesAnterior.data ?? []).reduce((s, r) => s + Number(r.valor_venda ?? 0), 0)
  const vendasAtual = conversoesAtual.data?.length ?? 0
  const vendasAnterior = conversoesAnterior.data?.length ?? 0
  const cliquesAtualCount = cliquesAtual.count ?? 0
  const cliquesAnteriorCount = cliquesAnterior.count ?? 0

  const taxaAtual = cliquesAtualCount > 0 ? (vendasAtual / cliquesAtualCount * 100) : 0
  const taxaAnterior = cliquesAnteriorCount > 0 ? (vendasAnterior / cliquesAnteriorCount * 100) : 0
  const ticketAtual = vendasAtual > 0 ? faturamentoAtual / vendasAtual : 0
  const ticketAnterior = vendasAnterior > 0 ? faturamentoAnterior / vendasAnterior : 0

  return {
    faturamento: calcDelta(faturamentoAtual, faturamentoAnterior),
    parceirosAtivos: calcDelta(parceirosAtivosTotal.count ?? 0, parceirosBaseline.count ?? 0),
    conversaoMedia: calcDelta(taxaAtual, taxaAnterior),
    ticketMedio: calcDelta(ticketAtual, ticketAnterior),
  }
}

export async function getClienteDashboard(clienteId: string) {
  const supabase = await createClient()
  const [cliente, parceiros, alertas] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', clienteId).single(),
    supabase
      .from('vw_cliente_dashboard')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('total_faturado', { ascending: false }),
    supabase
      .from('alertas_plano')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('resolvido', false),
  ])
  return { cliente: cliente.data, parceiros: parceiros.data, alertas: alertas.data }
}

export async function criarConvite(clienteId: string, emailDestinatario?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('convites')
    .insert({ cliente_id: clienteId, email_destinatario: emailDestinatario })
    .select('token')
    .single()
  if (error) throw error
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  return `${appUrl}/convite/${data.token}`
}

export async function atualizarStatusParceiro(parceiroId: string, status: 'ativo' | 'bloqueado') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('parceiros')
    .update({ status })
    .eq('id', parceiroId)
  if (error) throw error
}

export async function atualizarConfiguracoes(
  clienteId: string,
  dados: { nome_loja?: string; url_loja?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId)
  if (error) throw error
}

export async function getMateriaisCliente(clienteId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('materiais')
    .select('id, titulo, url, criado_em')
    .eq('cliente_id', clienteId)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarMaterialCliente(clienteId: string, titulo: string, url: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('materiais').insert({ cliente_id: clienteId, titulo, url: validarUrlMaterial(url), criado_por: 'cliente' })
  if (error) throw error
}

export async function excluirMaterialCliente(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('materiais').delete().eq('id', id)
  if (error) throw error
}

export async function testarWebhook(clienteId: string) {
  const appUrlTest = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const res = await fetch(`${appUrlTest}/api/webhook-test/${clienteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return res.ok
}
