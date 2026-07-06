import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import type { Notification } from '@/components/layout/Header'
import { createClient } from '@/lib/supabase/server'
import { getConfigPlataforma } from '@/lib/actions/admin'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })

function tempoRelativo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h}h`
  return `há ${Math.floor(h / 24)} dias`
}

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

  const { logoUrl } = await getConfigPlataforma()

  let conversaoCount = 0
  let notifications: Notification[] = []

  if (parceiro) {
    const [{ count }, { data: conversoes }] = await Promise.all([
      supabase
        .from('conversoes')
        .select('*', { count: 'exact', head: true })
        .eq('parceiro_id', parceiro.id)
        .eq('status', 'confirmada'),
      supabase
        .from('conversoes')
        .select('id, valor_venda, criado_em')
        .eq('parceiro_id', parceiro.id)
        .eq('status', 'confirmada')
        .order('criado_em', { ascending: false })
        .limit(5),
    ])
    conversaoCount = count ?? 0
    notifications = (conversoes ?? []).map(c => ({
      id: c.id,
      title: 'Nova venda confirmada',
      text: brl.format(Number(c.valor_venda)),
      time: tempoRelativo(c.criado_em),
      type: 'success' as const,
      href: '/minha-area/conversoes',
    }))
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar role="parceiro" counts={{ conversoes: conversaoCount }} logoUrl={logoUrl} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <Header title={`Olá, ${primeiroNome}`} subtitle="Acompanhe o desempenho dos seus links" userName={iniciais} notifications={notifications} />
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
