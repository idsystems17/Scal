import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { timingSafeEqual } from '@/lib/security/hmac'

// Remove os 3 usuários de teste criados pelo /api/seed-dev (admin@scal.dev,
// cliente@scal.dev, parceiro@scal.dev). Apagar o usuário em auth.users
// arrasta em cascata (ON DELETE CASCADE) tudo que depende dele: a empresa,
// o parceiro, os links, cliques e vendas de teste ligados a essa empresa.
// Rodar só depois de confirmado que os testes acabaram — é irreversível.
const EMAILS_DE_TESTE = ['admin@scal.dev', 'cliente@scal.dev', 'parceiro@scal.dev']

export async function GET(req: NextRequest) {
  const token = process.env.SEED_DEV_TOKEN
  const provided = req.nextUrl.searchParams.get('token') ?? ''
  if (!token || !timingSafeEqual(token, provided)) {
    return NextResponse.json({ error: 'not_found' }, { status: 404 })
  }

  const { data: list, error: listError } = await adminClient.auth.admin.listUsers()
  if (listError) {
    return NextResponse.json({ error: listError.message }, { status: 500 })
  }

  const removidos: string[] = []
  for (const email of EMAILS_DE_TESTE) {
    const user = list.users.find(u => u.email === email)
    if (!user) continue
    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (!error) removidos.push(email)
  }

  const { data: clientesRestantes } = await adminClient
    .from('clientes')
    .select('id, nome_loja, url_loja, criado_em')
    .order('criado_em', { ascending: true })

  return NextResponse.json({
    mensagem: 'Limpeza concluída',
    usuarios_de_teste_removidos: removidos,
    aviso: 'Isso só remove os 3 usuários de teste padrão do seed. Se alguma empresa de teste extra foi cadastrada manualmente (ex: em /admin/lojas), ela não é apagada automaticamente e aparece na lista abaixo para conferência.',
    empresas_restantes_no_banco: clientesRestantes ?? [],
  })
}
