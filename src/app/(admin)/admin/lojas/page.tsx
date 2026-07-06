import { adminClient } from '@/lib/supabase/admin'
import { TenantsTable } from '@/components/dashboard/TenantsTable'
import { NovoClienteButton } from '@/components/dashboard/NovoClienteButton'

export default async function LojasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const q = sp.q ?? ''

  const { data: tenants } = await adminClient
    .from('vw_admin_dashboard')
    .select('*')
    .order('alertas_pendentes', { ascending: false })

  const tenantsMapeados = (tenants ?? []).map(t => ({
    id: String(t.cliente_id ?? ''),
    nome: t.nome_loja ?? 'E-commerce',
    plataforma: t.plataforma_detectada ?? '—',
    parceiros: Number(t.parceiros_ativos_contagem ?? 0),
    limite_parceiros: Number(t.limite_parceiros_incluidos ?? 20),
    faturamento: Number(t.faturamento_acumulado_scal ?? 0),
    webhook_status: (t.webhook_confirmado ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
    status: (t.status ?? 'trial') as 'ativo' | 'suspenso' | 'trial' | 'cancelado',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>E-commerces ativos</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Todos os e-commerces na plataforma</p>
        </div>
        <NovoClienteButton />
      </div>
      <TenantsTable tenants={tenantsMapeados} searchQuery={q} />
    </div>
  )
}
