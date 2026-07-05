import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Rota temporária — remover antes de ir para produção real
export async function GET() {
  const resultados: Record<string, unknown>[] = []

  // ---- 1. CLIENTE ----
  let clienteUserId: string | null = null
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'cliente@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'cliente', nome: 'Loja Exemplo' },
    })
    if (error && !error.message.includes('already been registered')) {
      resultados.push({ passo: 'cliente_auth', erro: error.message })
    } else {
      clienteUserId = data?.user?.id ?? null
      if (!clienteUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        clienteUserId = list?.users.find(u => u.email === 'cliente@scal.dev')?.id ?? null
      }
      if (clienteUserId) {
        const { data: ex } = await adminClient.from('clientes').select('id').eq('user_id', clienteUserId).maybeSingle()
        if (!ex) {
          await adminClient.from('clientes').insert({
            user_id: clienteUserId,
            nome_loja: 'Loja Exemplo',
            url_loja: 'https://loja-exemplo.com.br',
            status: 'ativo',
          })
        }
      }
      resultados.push({ passo: 'cliente', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  // Busca o ID da tabela clientes
  let clienteId: string | null = null
  if (clienteUserId) {
    const { data } = await adminClient.from('clientes').select('id').eq('user_id', clienteUserId).maybeSingle()
    clienteId = data?.id ?? null
  }

  // ---- 2. PARCEIRO ----
  let parceiroId: string | null = null
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'parceiro@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'parceiro', nome: 'Marina Silva', cliente_id: clienteId },
    })
    if (error && !error.message.includes('already been registered')) {
      resultados.push({ passo: 'parceiro_auth', erro: error.message })
    } else {
      let parceiroUserId = data?.user?.id ?? null
      if (!parceiroUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        parceiroUserId = list?.users.find(u => u.email === 'parceiro@scal.dev')?.id ?? null
      }
      if (parceiroUserId && clienteId) {
        const { data: ex } = await adminClient.from('parceiros').select('id').eq('user_id', parceiroUserId).maybeSingle()
        if (!ex) {
          const { data: p } = await adminClient.from('parceiros').insert({
            user_id: parceiroUserId,
            cliente_id: clienteId,
            nome: 'Marina Silva',
            email: 'parceiro@scal.dev',
            codigo_unico: 'MARINA',
            status: 'ativo',
          }).select('id').single()
          parceiroId = p?.id ?? null
        } else {
          parceiroId = ex.id
        }
      }
      resultados.push({ passo: 'parceiro', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  // ---- 3. ADMIN ----
  {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: 'admin@scal.dev',
      password: 'Scal@2024',
      email_confirm: true,
      user_metadata: { role: 'admin', nome: 'Admin SCAL' },
    })
    if (error && !error.message.includes('already been registered')) {
      resultados.push({ passo: 'admin_auth', erro: error.message })
    } else {
      let adminUserId = data?.user?.id ?? null
      if (!adminUserId) {
        const { data: list } = await adminClient.auth.admin.listUsers()
        adminUserId = list?.users.find(u => u.email === 'admin@scal.dev')?.id ?? null
      }
      if (adminUserId) {
        const { data: ex } = await adminClient.from('admins').select('id').eq('user_id', adminUserId).maybeSingle()
        if (!ex) {
          await adminClient.from('admins').insert({ user_id: adminUserId, nome: 'Admin SCAL', email: 'admin@scal.dev' })
        }
      }
      resultados.push({ passo: 'admin', status: data?.user ? 'criado' : 'já existe' })
    }
  }

  // ---- 4. LINKS DE TESTE ----
  const linksIds: string[] = []
  if (parceiroId && clienteId) {
    const canaisTeste = [
      { canal: 'Instagram', codigo: 'MARINA-IG' },
      { canal: 'WhatsApp', codigo: 'MARINA-WA' },
    ]
    for (const { canal, codigo } of canaisTeste) {
      const { data: ex } = await adminClient.from('links').select('id').eq('codigo', codigo).maybeSingle()
      if (!ex) {
        const { data: link } = await adminClient.from('links').insert({
          parceiro_id: parceiroId,
          cliente_id: clienteId,
          codigo,
          destino_url: 'https://loja-exemplo.com.br/produto',
          canal,
          ativo: true,
        }).select('id').single()
        if (link) linksIds.push(link.id)
      } else {
        linksIds.push(ex.id)
      }
    }
    resultados.push({ passo: 'links', criados: linksIds.length })
  }

  // ---- 5. CLIQUES DE TESTE ----
  const clickIds: string[] = []
  if (linksIds.length > 0 && clienteId) {
    for (let i = 0; i < 3; i++) {
      const linkId = linksIds[i % linksIds.length]
      const clickId = crypto.randomUUID()
      const { error } = await adminClient.from('cliques').insert({
        link_id: linkId,
        cliente_id: clienteId,
        click_id: clickId,
        ip_hash: 'test_ip_hash_' + i,
        user_agent: 'Mozilla/5.0 (seed)',
      })
      if (!error) clickIds.push(clickId)
    }
    resultados.push({ passo: 'cliques', criados: clickIds.length })
  }

  // ---- 6. CONVERSÕES DE TESTE ----
  if (clickIds.length > 0 && parceiroId && clienteId) {
    const vendas = [
      { valor: 297.00, pedido: 'PED-SEED-001' },
      { valor: 497.00, pedido: 'PED-SEED-002' },
    ]
    let conversoesCriadas = 0
    for (let i = 0; i < vendas.length; i++) {
      const { data: ex } = await adminClient.from('conversoes').select('id').eq('pedido_externo_id', vendas[i].pedido).eq('cliente_id', clienteId).maybeSingle()
      if (!ex) {
        await adminClient.from('conversoes').insert({
          cliente_id: clienteId,
          click_id: clickIds[i % clickIds.length],
          parceiro_id: parceiroId,
          pedido_externo_id: vendas[i].pedido,
          valor_venda: vendas[i].valor,
          status: 'confirmada',
          webhook_payload_raw: { origem: 'seed-dev' },
        })
        conversoesCriadas++
      }
    }

    // Atualiza webhook_confirmado e faturamento no cliente
    await adminClient.from('clientes').update({
      webhook_confirmado: true,
      webhook_ultimo_evento: new Date().toISOString(),
    }).eq('id', clienteId)

    resultados.push({ passo: 'conversoes', criadas: conversoesCriadas })
  }

  return NextResponse.json({
    mensagem: 'Seed completo!',
    resultados,
    credenciais: [
      { email: 'cliente@scal.dev', senha: 'Scal@2024', role: 'cliente' },
      { email: 'parceiro@scal.dev', senha: 'Scal@2024', role: 'parceiro' },
      { email: 'admin@scal.dev', senha: 'Scal@2024', role: 'admin' },
    ],
  })
}
