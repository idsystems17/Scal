import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { Notification } from '@/components/layout/Header'
import { adminClient } from '@/lib/supabase/admin'
import { getConfigPlataforma } from '@/lib/actions/admin'

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const [{ count: alertaCount }, { data: alertas }, { logoUrl }] = await Promise.all([
    adminClient
      .from('alertas_plano')
      .select('*', { count: 'exact', head: true })
      .eq('resolvido', false),
    adminClient
      .from('alertas_plano')
      .select('id, tipo, valor_no_momento, notificado_em, clientes(nome_loja)')
      .eq('resolvido', false)
      .order('notificado_em', { ascending: false })
      .limit(5),
    getConfigPlataforma(),
  ])

  const notifications: Notification[] = (alertas ?? []).map(a => ({
    id: a.id,
    title: a.tipo === 'limite_parceiros_excedido' ? 'Limite de parceiros' : 'Limite de faturamento',
    text: `${(a.clientes as unknown as { nome_loja: string } | null)?.nome_loja ?? 'E-commerce'}: ${a.valor_no_momento}`,
    time: tempoRelativo(a.notificado_em),
    type: 'alert' as const,
    href: '/admin/alertas',
  }))

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="admin" counts={{ alertas: alertaCount ?? 0 }} logoUrl={logoUrl} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title="Painel Admin" subtitle="Central de operações SCAL" userName="AD" notifications={notifications} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
