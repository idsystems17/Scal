import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = (user?.user_metadata?.nome as string) || 'Loja'
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="cliente" />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title="Dashboard" subtitle={`Visão geral — ${nome}`} userName={iniciais} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
