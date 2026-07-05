import { adminClient } from '@/lib/supabase/admin'
import { TenantsTable } from '@/components/dashboard/TenantsTable'

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
    nome: t.nome_loja ?? 'Empresa',
    plataforma: t.plataforma_detectada ?? '—',
    parceiros: Number(t.parceiros_ativos_contagem ?? 0),
    limite_parceiros: Number(t.limite_parceiros_incluidos ?? 20),
    faturamento: Number(t.faturamento_acumulado_scal ?? 0),
    webhook_status: (t.webhook_confirmado ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
    status: (t.status ?? 'trial') as 'ativo' | 'suspenso' | 'trial' | 'cancelado',
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Empresas ativas</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Todas as empresas na plataforma</p>
      </div>
      <TenantsTable tenants={tenantsMapeados} searchQuery={q} />
    </div>
  )
}
