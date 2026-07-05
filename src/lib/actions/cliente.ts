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
  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  return `${appUrl}/convite/${data.token}`
}

export async function atualizarStatusParceiro(parceiroId: string, status: 'ativo' | 'bloqueado') {
  const supabase = await createClient()
  const { error } = await supabase
    .from('parceiros')
    .update({ status })
    .eq('id', parceiroId)
  if (error) throw error
}

export async function atualizarConfiguracoes(
  clienteId: string,
  dados: { nome_loja?: string; url_loja?: string }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('clientes')
    .update(dados)
    .eq('id', clienteId)
  if (error) throw error
}

export async function testarWebhook(clienteId: string) {
  const appUrlTest = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'https://scal-sigma.vercel.app'
  const res = await fetch(`${appUrlTest}/api/webhook-test/${clienteId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  })
  return res.ok
}
