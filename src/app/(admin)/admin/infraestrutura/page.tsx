import { adminClient } from '@/lib/supabase/admin'
import { MonitorChart } from '@/components/dashboard/MonitorChart'
import { getMonitorData } from '@/lib/actions/admin'

export const dynamic = 'force-dynamic'

const num = new Intl.NumberFormat('pt-BR')

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

export default async function InfraestruturaPage() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [
    monitorData,
    { count: cliques24h },
    { count: conversoes24h },
    { count: webhooks24h },
    { count: erros24h },
    { count: cliques7d },
    { data: ultimosEventos },
    { data: webhookStatus },
  ] = await Promise.all([
    getMonitorData(),
    adminClient.from('cliques').select('*', { count: 'exact', head: true }).gte('criado_em', since24h),
    adminClient.from('conversoes').select('*', { count: 'exact', head: true }).gte('criado_em', since24h),
    adminClient.from('eventos').select('*', { count: 'exact', head: true }).eq('tipo', 'webhook_recebido').gte('criado_em', since24h),
    adminClient.from('eventos').select('*', { count: 'exact', head: true }).eq('tipo', 'erro').gte('criado_em', since24h),
    adminClient.from('cliques').select('*', { count: 'exact', head: true }).gte('criado_em', since7d),
    adminClient
      .from('eventos')
      .select('id, tipo, payload_json, criado_em')
      .order('criado_em', { ascending: false })
      .limit(20),
    adminClient
      .from('clientes')
      .select('id, nome_loja, webhook_confirmado, webhook_ultimo_evento')
      .order('webhook_ultimo_evento', { ascending: false })
      .limit(20),
  ])

  const taxaErro = (cliques24h ?? 0) > 0 ? ((erros24h ?? 0) / (cliques24h ?? 1) * 100) : 0

  const TIPO_LABELS: Record<string, { label: string; color: string; bg: string }> = {
    clique: { label: 'Clique', color: '#2563eb', bg: '#eff6ff' },
    webhook_recebido: { label: 'Webhook', color: '#16a34a', bg: '#ecfdf3' },
    conversao_confirmada: { label: 'Conversão', color: '#9B6AFF', bg: '#eef2ff' },
    estorno: { label: 'Estorno', color: '#d97706', bg: '#fffbeb' },
    erro: { label: 'Erro', color: '#e11d48', bg: '#fff1f3' },
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Infraestrutura</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Monitoramento de redirecionamentos, webhooks e performance</p>
      </div>

      {/* KPIs 24h */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        {[
          { label: 'Cliques 24h', value: num.format(cliques24h ?? 0), sub: 'redirecionamentos', color: '#2563eb' },
          { label: 'Conversões 24h', value: num.format(conversoes24h ?? 0), sub: 'webhooks confirmados', color: '#9B6AFF' },
          { label: 'Webhooks 24h', value: num.format(webhooks24h ?? 0), sub: 'eventos recebidos', color: '#16a34a' },
          { label: 'Taxa de erro', value: `${taxaErro.toFixed(1).replace('.', ',')}%`, sub: `${num.format(erros24h ?? 0)} erros`, color: (erros24h ?? 0) > 5 ? '#e11d48' : '#0B081A' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Gráfico MonitorChart expandido */}
      <MonitorChart data={monitorData} />

      {/* Estatística 7 dias + webhooks por empresa */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>
        {/* Volume 7d */}
        <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 20px' }}>Volume 7 dias</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'Total de cliques', value: num.format(cliques7d ?? 0), color: '#2563eb' },
              { label: 'Média diária', value: num.format(Math.round((cliques7d ?? 0) / 7)), color: '#9B6AFF' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#f8fafc', borderRadius: 10 }}>
                <span style={{ fontSize: 13, color: '#64748b' }}>{item.label}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status webhooks */}
        <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 8px' }}>Status webhooks por e-commerce</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 16px' }}>
            {webhookStatus?.filter(w => w.webhook_confirmado).length ?? 0} de {webhookStatus?.length ?? 0} configurados
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
            {(webhookStatus ?? []).map(w => (
              <div key={w.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', borderRadius: 8, background: '#f8fafc' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: w.webhook_confirmado ? '#16a34a' : '#94a3b8', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#0B081A', fontWeight: 500 }}>{w.nome_loja}</span>
                </div>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {w.webhook_ultimo_evento ? tempoRelativo(w.webhook_ultimo_evento) : 'Nunca'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Log de eventos recentes */}
      <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Eventos recentes</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Últimos 20 eventos do sistema</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {(ultimosEventos ?? []).map(e => {
            const info = TIPO_LABELS[e.tipo] ?? { label: e.tipo, color: '#64748b', bg: '#f1f5f9' }
            const payload = e.payload_json as Record<string, unknown> | null
            const detalhe = payload?.cliente_id
              ? `cliente: ${String(payload.cliente_id).slice(0, 8)}…`
              : payload?.pedido_id
              ? `pedido: ${payload.pedido_id}`
              : payload?.motivo
              ? String(payload.motivo)
              : ''
            return (
              <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 8, background: '#f8fafc' }}>
                <span style={{ padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, background: info.bg, color: info.color, flexShrink: 0 }}>
                  {info.label}
                </span>
                <span style={{ fontSize: 12, color: '#64748b', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {detalhe || '—'}
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8', whiteSpace: 'nowrap', flexShrink: 0 }}>
                  {tempoRelativo(e.criado_em)}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
