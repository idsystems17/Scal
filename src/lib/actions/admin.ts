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
