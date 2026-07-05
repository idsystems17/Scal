'use server'
import { adminClient } from '@/lib/supabase/admin'

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
  })
}

export async function atualizarStatusTenant(clienteId: string, status: 'ativo' | 'suspenso') {
  await adminClient.from('clientes').update({ status }).eq('id', clienteId)
  await adminClient.from('audit_log').insert({
    ator_tipo: 'admin',
    acao: 'atualizar_status_tenant',
    detalhes_json: { cliente_id: clienteId, status },
  })
}
