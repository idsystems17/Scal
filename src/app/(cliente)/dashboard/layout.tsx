import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { Notification } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = (user?.user_metadata?.nome as string) || 'Empresa'
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  let parceiroCount = 0
  let notifications: Notification[] = []

  if (clienteRow) {
    const [{ count }, { data: alertas }] = await Promise.all([
      supabase
        .from('parceiros')
        .select('*', { count: 'exact', head: true })
        .eq('cliente_id', clienteRow.id)
        .eq('status', 'ativo'),
      supabase
        .from('alertas_plano')
        .select('id, tipo, valor_no_momento, notificado_em')
        .eq('cliente_id', clienteRow.id)
        .eq('resolvido', false)
        .order('notificado_em', { ascending: false })
        .limit(5),
    ])
    parceiroCount = count ?? 0
    notifications = (alertas ?? []).map(a => ({
      id: a.id,
      title: a.tipo === 'limite_parceiros_excedido' ? 'Limite de parceiros atingido' : 'Limite de faturamento atingido',
      text: `Atual: ${a.valor_no_momento}`,
      time: tempoRelativo(a.notificado_em),
      type: 'alert' as const,
      href: '/dashboard',
    }))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="cliente" counts={{ parceiros: parceiroCount }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title="Dashboard" subtitle={`Visão geral — ${nome}`} userName={iniciais} notifications={notifications} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
