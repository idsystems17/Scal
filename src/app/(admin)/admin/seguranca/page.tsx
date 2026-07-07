import { adminClient } from '@/lib/supabase/admin'
import { AnomalyList } from '@/components/dashboard/AnomalyList'

const num = new Intl.NumberFormat('pt-BR')

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min}min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

const ACAO_LABELS: Record<string, string> = {
  suspender_cliente: 'E-commerce suspenso',
  reativar_cliente: 'E-commerce reativado',
  resolver_alerta: 'Alerta resolvido',
  aplicar_taxa: 'Taxa aplicada',
  bloquear_parceiro: 'Parceiro bloqueado',
  desbloquear_parceiro: 'Parceiro desbloqueado',
  convidar_parceiro: 'Convite criado',
}

const ATOR_COLORS: Record<string, string> = {
  admin: '#9B6AFF',
  cliente: '#2563eb',
  parceiro: '#16a34a',
  sistema: '#64748b',
}

export default async function SegurancaPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const days = Number(sp.period ?? 7)
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()

  const [{ data: auditLog, count: totalAudits }, { data: erros24h }, { data: webhooksInvalidos }] = await Promise.all([
    adminClient
      .from('audit_log')
      .select('id, ator_tipo, ator_id, acao, detalhes_json, ip, criado_em', { count: 'exact' })
      .gte('criado_em', since)
      .order('criado_em', { ascending: false })
      .limit(200),
    adminClient
      .from('eventos')
      .select('id, payload_json, criado_em')
      .eq('tipo', 'erro')
      .gte('criado_em', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('criado_em', { ascending: false })
      .limit(100),
    adminClient
      .from('eventos')
      .select('id, payload_json, criado_em')
      .eq('tipo', 'erro')
      .like('payload_json->>motivo', '%hmac%')
      .gte('criado_em', since)
      .limit(50),
  ])

  const anomalias = (erros24h ?? []).map(e => ({
    descricao: (e.payload_json as Record<string, string> | null)?.motivo ?? 'Erro sem descrição',
    tempo: tempoRelativo(e.criado_em),
    loja: (e.payload_json as Record<string, string> | null)?.cliente_id?.slice(0, 8) ?? 'sistema',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Segurança</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Auditoria de ações e detecção de anomalias — últimos {days} dias</p>
      </div>

      {/* KPIs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {[
          { label: 'Ações auditadas', value: num.format(totalAudits ?? 0), sub: `últimos ${days} dias`, color: '#0B081A' },
          { label: 'Erros nas últimas 24h', value: num.format(erros24h?.length ?? 0), sub: 'webhooks e sistema', color: (erros24h?.length ?? 0) > 10 ? '#e11d48' : '#0B081A' },
          { label: 'Assinaturas inválidas', value: num.format(webhooksInvalidos?.length ?? 0), sub: `últimos ${days} dias`, color: (webhooksInvalidos?.length ?? 0) > 0 ? '#e11d48' : '#16a34a' },
        ].map((k, i) => (
          <div key={i} style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '20px 24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: '0 0 8px', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>{k.label}</p>
            <p style={{ fontSize: 24, fontWeight: 800, color: k.color, margin: 0 }}>{k.value}</p>
            <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Anomalias */}
      {anomalias.length > 0 && (
        <AnomalyList anomalias={anomalias} />
      )}

      {anomalias.length === 0 && (
        <div style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 8px' }}>Detecção de anomalias</h3>
          <div style={{ padding: '24px 0', textAlign: 'center', color: '#16a34a' }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nenhuma anomalia nas últimas 24h</p>
            <p style={{ fontSize: 13, color: '#64748b', margin: '6px 0 0' }}>Tudo funcionando normalmente.</p>
          </div>
        </div>
      )}

      {/* Audit log */}
      <div style={{ background: 'white', border: '1px solid #dbe0e9', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Log de auditoria</h3>
          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{num.format(totalAudits ?? 0)} ações nos últimos {days} dias</p>
        </div>

        {(!auditLog || auditLog.length === 0) ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
            <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>Nenhuma ação registrada neste período</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e5e9ed' }}>
                {['QUANDO', 'ATOR', 'AÇÃO', 'DETALHES', 'IP'].map(h => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {auditLog.map(a => {
                const detalhes = a.detalhes_json as Record<string, unknown> | null
                const descricaoDetalhes = detalhes
                  ? Object.entries(detalhes).map(([k, v]) => `${k}: ${v}`).join(' · ')
                  : '—'
                return (
                  <tr key={a.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: '#64748b', whiteSpace: 'nowrap' }}>{tempoRelativo(a.criado_em)}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{
                        padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                        background: `${ATOR_COLORS[a.ator_tipo ?? 'sistema']}15`,
                        color: ATOR_COLORS[a.ator_tipo ?? 'sistema'],
                      }}>
                        {a.ator_tipo ?? 'sistema'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 13, fontWeight: 600, color: '#0B081A' }}>
                      {ACAO_LABELS[a.acao] ?? a.acao}
                    </td>
                    <td style={{ padding: '12px 12px', fontSize: 12, color: '#64748b', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {descricaoDetalhes}
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'monospace', fontSize: 11, color: '#94a3b8' }}>
                      {a.ip ?? '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
