import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClienteDashboard } from '@/lib/actions/cliente'
import { PartnersTable } from '@/components/dashboard/PartnersTable'
import { ConviteModal } from '@/components/dashboard/ConviteModal'
import ParceiroPageClient from './ParceiroPageClient'

export default async function ParceirosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) redirect('/dashboard')

  const { parceiros } = await getClienteDashboard(clienteRow.id)

  const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0 })
  const parceirosMapeados = (parceiros ?? []).map(p => ({
    id: String(p.parceiro_id ?? ''),
    nome: String(p.nome ?? ''),
    codigo: String(p.codigo_unico ?? ''),
    clicks: Number(p.total_cliques ?? 0),
    sales: Number(p.total_conversoes ?? 0),
    revenue: Number(p.total_faturado ?? 0),
    status: (Number(p.total_faturado ?? 0) > 10000 ? 'top' : p.status === 'bloqueado' ? 'inativo' : 'ativo') as 'top' | 'ativo' | 'baixa_conversao' | 'inativo' | 'bloqueado',
    statusReal: (p.status ?? 'ativo') as 'ativo' | 'pendente' | 'bloqueado',
  }))

  return <ParceiroPageClient clienteId={clienteRow.id} parceiros={parceirosMapeados} />
}
