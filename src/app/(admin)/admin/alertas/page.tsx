import { adminClient } from '@/lib/supabase/admin'
import { AlertsPanel } from '@/components/dashboard/AlertsPanel'

export default async function AlertasPage() {
  const { data: alertas } = await adminClient
    .from('alertas_plano')
    .select('*, clientes(nome_loja)')
    .eq('resolvido', false)
    .order('notificado_em', { ascending: false })

  const alertasMapeados = (alertas ?? []).map(a => ({
    id: a.id,
    cliente_nome: (a.clientes as { nome_loja: string } | null)?.nome_loja ?? 'Loja',
    tipo: a.tipo === 'limite_parceiros_excedido' ? 'limite_parceiros' : 'limite_faturamento' as 'limite_parceiros' | 'limite_faturamento',
    valor_atual: a.valor_no_momento ?? '—',
    limite: a.tipo === 'limite_parceiros_excedido' ? '20 parceiros' : 'R$ 100.000',
    resolvido: a.resolvido,
  }))

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Alertas de plano</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Lojas que excederam limites do plano</p>
      </div>
      <AlertsPanel alertas={alertasMapeados} />
    </div>
  )
}
