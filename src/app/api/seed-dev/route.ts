import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

// Rota temporária para criar usuários de teste — remover antes de ir para produção real
const USUARIOS = [
  { email: 'parceiro@scal.dev', senha: 'Scal@2024', role: 'parceiro', nome: 'Marina Silva' },
  { email: 'cliente@scal.dev', senha: 'Scal@2024', role: 'cliente', nome: 'Loja Exemplo' },
  { email: 'admin@scal.dev', senha: 'Scal@2024', role: 'admin', nome: 'Admin SCAL' },
]

export async function GET() {
  const resultados = []

  for (const u of USUARIOS) {
    const { data, error } = await adminClient.auth.admin.createUser({
      email: u.email,
      password: u.senha,
      email_confirm: true,
      user_metadata: { role: u.role, nome: u.nome },
    })

    if (error && !error.message.includes('already been registered')) {
      resultados.push({ email: u.email, status: 'erro', detalhe: error.message })
    } else {
      resultados.push({ email: u.email, role: u.role, status: data?.user ? 'criado' : 'já existe' })
    }
  }

  return NextResponse.json({
    mensagem: 'Usuários de teste prontos!',
    usuarios: resultados,
    credenciais: USUARIOS.map(u => ({ email: u.email, senha: u.senha, role: u.role })),
  })
}
