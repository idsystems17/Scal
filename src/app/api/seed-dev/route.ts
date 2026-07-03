import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Rota temporária para criar usuários de teste — remover antes de ir para produção real
export async function GET() {
  const resultados = []

  // 1. Cliente (lojista)
  let clienteUserId: string | null = null
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'cliente@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'cliente', nome: 'Loja Exemplo' },
    })

    if (error && !error.message.includes('already been registered')) {
      resultados.push({ email: 'cliente@scal.dev', status: 'erro', detalhe: error.message })
    } else {
      clienteUserId = data?.user?.id ?? null

      // Busca user_id se já existia
      if (!clienteUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        clienteUserId = list?.users.find(u => u.email === 'cliente@scal.dev')?.id ?? null
      }

      // Cria ou ignora registro em clientes
      if (clienteUserId) {
        const { data: existente } = await adminClient.from('clientes').select('id').eq('user_id', clienteUserId).maybeSingle()
        if (!existente) {
          await adminClient.from('clientes').insert({
            user_id: clienteUserId,
            nome_loja: 'Loja Exemplo',
            url_loja: 'https://loja-exemplo.com.br',
            status: 'ativo',
          })
        }
      }
      resultados.push({ email: 'cliente@scal.dev', role: 'cliente', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  // Busca o id do cliente na tabela para usar no parceiro
  let clienteId: string | null = null
  if (clienteUserId) {
    const { data } = await adminClient.from('clientes').select('id').eq('user_id', clienteUserId).maybeSingle()
    clienteId = data?.id ?? null
  }

  // 2. Parceiro
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'parceiro@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'parceiro', nome: 'Marina Silva', cliente_id: clienteId },
    })

    if (error && !error.message.includes('already been registered')) {
      resultados.push({ email: 'parceiro@scal.dev', status: 'erro', detalhe: error.message })
    } else {
      let parceiroUserId = data?.user?.id ?? null
      if (!parceiroUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        parceiroUserId = list?.users.find(u => u.email === 'parceiro@scal.dev')?.id ?? null
      }

      if (parceiroUserId && clienteId) {
        const { data: existente } = await adminClient.from('parceiros').select('id').eq('user_id', parceiroUserId).maybeSingle()
        if (!existente) {
          await adminClient.from('parceiros').insert({
            user_id: parceiroUserId,
            cliente_id: clienteId,
            nome: 'Marina Silva',
            email: 'parceiro@scal.dev',
            codigo_unico: 'MARINA',
            status: 'ativo',
          })
        }
      }
      resultados.push({ email: 'parceiro@scal.dev', role: 'parceiro', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  // 3. Admin
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'admin@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'admin', nome: 'Admin SCAL' },
    })

    if (error && !error.message.includes('already been registered')) {
      resultados.push({ email: 'admin@scal.dev', status: 'erro', detalhe: error.message })
    } else {
      let adminUserId = data?.user?.id ?? null
      if (!adminUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        adminUserId = list?.users.find(u => u.email === 'admin@scal.dev')?.id ?? null
      }

      if (adminUserId) {
        const { data: existente } = await adminClient.from('admins').select('id').eq('user_id', adminUserId).maybeSingle()
        if (!existente) {
          await adminClient.from('admins').insert({
            user_id: adminUserId,
            nome: 'Admin SCAL',
            email: 'admin@scal.dev',
          })
        }
      }
      resultados.push({ email: 'admin@scal.dev', role: 'admin', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  return NextResponse.json({
    mensagem: 'Seed completo!',
    usuarios: resultados,
    credenciais: [
      { email: 'cliente@scal.dev', senha: 'Scal@2024', role: 'cliente' },
      { email: 'parceiro@scal.dev', senha: 'Scal@2024', role: 'parceiro' },
      { email: 'admin@scal.dev', senha: 'Scal@2024', role: 'admin' },
    ],
  })
}
