import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'

export default async function ParceiroLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const nome = (user?.user_metadata?.nome as string) || 'Parceiro'
  const primeiroNome = nome.split(' ')[0]
  const iniciais = nome.split(' ').slice(0, 2).map((n: string) => n[0]).join('').toUpperCase()

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id')
    .eq('user_id', user?.id ?? '')
    .maybeSingle()

  let conversaoCount = 0
  if (parceiro) {
    const { count } = await supabase
      .from('conversoes')
      .select('*', { count: 'exact', head: true })
      .eq('parceiro_id', parceiro.id)
      .eq('status', 'confirmada')
    conversaoCount = count ?? 0
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="parceiro" counts={{ conversoes: conversaoCount }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={`Olá, ${primeiroNome}`} subtitle="Acompanhe o desempenho dos seus links" userName={iniciais} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
