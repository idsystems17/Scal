import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getClienteDashboard } from '@/lib/actions/cliente'
import { ClienteDashboardClient } from './ClienteDashboardClient'

export default async function ClientePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
        <div style={{ textAlign: 'center', color: '#64748b' }}>
          <p style={{ fontSize: 18, fontWeight: 600, margin: '0 0 8px' }}>Conta não configurada</p>
          <p style={{ fontSize: 14 }}>Entre em contato com o suporte SCAL.</p>
        </div>
      </div>
    )
  }

  const { cliente, parceiros, alertas } = await getClienteDashboard(clienteRow.id)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const webhookUrl = `${appUrl}/webhook/${clienteRow.id}`

  return <ClienteDashboardClient clienteId={clienteRow.id} webhookUrl={webhookUrl} cliente={cliente} parceiros={parceiros ?? []} alertas={alertas ?? []} />
}
