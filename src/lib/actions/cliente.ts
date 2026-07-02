'use server'
import { createClient } from '@/lib/supabase/server'

export async function getClienteDashboard(clienteId: string) {
  const supabase = await createClient()
  const [cliente, parceiros, alertas] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', clienteId).single(),
    supabase
      .from('vw_cliente_dashboard')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('total_faturado', { ascending: false }),
    supabase
      .from('alertas_plano')
      .select('*')
      .eq('cliente_id', clienteId)
      .eq('resolvido', false),
  ])
  return { cliente: cliente.data, parceiros: parceiros.data, alertas: alertas.data }
}

export async function criarConvite(clienteId: string, emailDestinatario?: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('convites')
    .insert({ cliente_id: clienteId, email_destinatario: emailDestinatario })
    .select('token')
    .single()
  if (error) throw error
  return `${process.env.NEXT_PUBLIC_APP_URL}/convite/${data.token}`
}

export async function testarWebhook(clienteId: string) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/webhook-test/${clienteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return res.ok
}
