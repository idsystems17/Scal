import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = (user?.user_metadata?.nome as string) || 'Loja'
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  let parceiroCount = 0
  if (clienteRow) {
    const { count } = await supabase
      .from('parceiros')
      .select('*', { count: 'exact', head: true })
      .eq('cliente_id', clienteRow.id)
      .eq('status', 'ativo')
    parceiroCount = count ?? 0
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="cliente" counts={{ parceiros: parceiroCount }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title="Dashboard" subtitle={`Visão geral — ${nome}`} userName={iniciais} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
