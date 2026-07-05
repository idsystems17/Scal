'use server'
import { headers } from 'next/headers'
import { adminClient } from '@/lib/supabase/admin'
import { hashIP } from '@/lib/security/hash'
import { calcDelta, periodWindows } from '@/lib/deltas'

async function getActorIpHash() {
  const h = await headers()
  const ip = h.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  return hashIP(ip)
}

export async function getAdminDashboard() {
  const [tenants, alertas, anomalias] = await Promise.all([
    adminClient
      .from('vw_admin_dashboard')
      .select('*')
      .order('alertas_pendentes', { ascending: false }),
    adminClient
      .from('alertas_plano')
      .select('*, clientes(nome_loja)')
      .eq('resolvido', false)
      .order('notificado_em', { ascending: false }),
    adminClient
      .from('eventos')
      .select('*')
      .eq('tipo', 'erro')
      .order('criado_em', { ascending: false })
      .limit(10),
  ])
  return { tenants: tenants.data, alertas: alertas.data, anomalias: anomalias.data }
}

export async function getAdminKpiDeltas(days: number) {
  const { now, since, sincePrevious } = periodWindows(days)

  const [
    empresasBaseline, empresasTotal,
    parceirosBaseline, parceirosTotal,
    faturamentoAtual, faturamentoAnterior,
    alertasAtual, alertasAnterior,
  ] = await Promise.all([
    adminClient.from('clientes').select('id', { count: 'exact', head: true }).lt('criado_em', since),
    adminClient.from('clientes').select('id', { count: 'exact', head: true }),
    adminClient.from('parceiros').select('id', { count: 'exact', head: true }).lt('criado_em', since),
    adminClient.from('parceiros').select('id', { count: 'exact', head: true }),
    adminClient.from('conversoes').select('valor_venda').eq('status', 'confirmada').gte('criado_em', since).lt('criado_em', now),
    adminClient.from('conversoes').select('valor_venda').eq('status', 'confirmada').gte('criado_em', sincePrevious).lt('criado_em', since),
    adminClient.from('alertas_plano').select('id', { count: 'exact', head: true }).gte('notificado_em', since).lt('notificado_em', now),
    adminClient.from('alertas_plano').select('id', { count: 'exact', head: true }).gte('notificado_em', sincePrevious).lt('notificado_em', since),
  ])

  const somaFaturamento = (rows: { valor_venda: number }[] | null) =>
    (rows ?? []).reduce((s, r) => s + Number(r.valor_venda ?? 0), 0)

  return {
    empresas: calcDelta(empresasTotal.count ?? 0, empresasBaseline.count ?? 0),
    parceiros: calcDelta(parceirosTotal.count ?? 0, parceirosBaseline.count ?? 0),
    faturamento: calcDelta(somaFaturamento(faturamentoAtual.data), somaFaturamento(faturamentoAnterior.data)),
    alertas: calcDelta(alertasAtual.count ?? 0, alertasAnterior.count ?? 0, false),
  }
}

export async function getMonitorData() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const [{ data: cliques24h }, { data: erros24h }] = await Promise.all([
    adminClient.from('cliques').select('criado_em').gte('criado_em', since24h),
    adminClient.from('eventos').select('criado_em').eq('tipo', 'erro').gte('criado_em', since24h),
  ])

  const hoursMap: Record<number, { sucesso: number; erros: number }> = {}
  for (let h = 0; h < 24; h++) hoursMap[h] = { sucesso: 0, erros: 0 }

  cliques24h?.forEach(c => { hoursMap[new Date(c.criado_em).getHours()].sucesso++ })
  erros24h?.forEach(e => { hoursMap[new Date(e.criado_em).getHours()].erros++ })

  const nowHour = new Date().getHours()
  const hours = Array.from({ length: 7 }, (_, i) => (nowHour - 6 + i + 24) % 24)

  return {
    labels: hours.map(h => `${String(h).padStart(2, '0')}h`),
    sucesso: hours.map(h => hoursMap[h].sucesso),
    erros: hours.map(h => hoursMap[h].erros),
  }
}

export async function resolverAlerta(alertaId: string) {
  await adminClient
    .from('alertas_plano')
    .update({ resolvido: true, resolvido_em: new Date().toISOString() })
    .eq('id', alertaId)
  await adminClient.from('audit_log').insert({
    ator_tipo: 'admin',
    acao: 'resolver_alerta',
    detalhes_json: { alerta_id: alertaId },
    ip: await getActorIpHash(),
  })
}

export async function aplicarTaxaExcedente(alertaId: string) {
  await adminClient
    .from('alertas_plano')
    .update({ resolvido: true, resolvido_em: new Date().toISOString() })
    .eq('id', alertaId)
  await adminClient.from('audit_log').insert({
    ator_tipo: 'admin',
    acao: 'taxa_excedente_aplicada',
    detalhes_json: { alerta_id: alertaId, taxa: '0.5%' },
    ip: await getActorIpHash(),
  })
}

export async function getMateriaisGlobais() {
  const { data } = await adminClient
    .from('materiais')
    .select('id, titulo, url, criado_em')
    .is('cliente_id', null)
    .order('criado_em', { ascending: false })
  return data ?? []
}

export async function criarMaterialGlobal(titulo: string, url: string) {
  const { error } = await adminClient.from('materiais').insert({ titulo, url, criado_por: 'admin', cliente_id: null })
  if (error) throw error
}

export async function excluirMaterialGlobal(id: string) {
  const { error } = await adminClient.from('materiais').delete().eq('id', id)
  if (error) throw error
}

export async function atualizarStatusTenant(clienteId: string, status: 'ativo' | 'suspenso') {
  await adminClient.from('clientes').update({ status }).eq('id', clienteId)
  await adminClient.from('audit_log').insert({
    ator_tipo: 'admin',
    acao: 'atualizar_status_tenant',
    detalhes_json: { cliente_id: clienteId, status },
    ip: await getActorIpHash(),
  })
}
