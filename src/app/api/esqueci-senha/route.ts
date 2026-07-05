import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/ratelimit'
import { hashIP } from '@/lib/security/hash'

const MENSAGEM_GENERICA = 'Se este e-mail estiver cadastrado, você vai receber um link para redefinir sua senha.'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (!(await checkRateLimit(`esqueci-senha:${hashIP(ip)}`, 5, 60 * 60_000))) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente mais tarde.' }, { status: 429 })
  }

  const { email } = await req.json()
  if (!email) {
    return NextResponse.json({ error: 'Informe um e-mail.' }, { status: 400 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || `${req.nextUrl.protocol}//${req.nextUrl.host}`
  const supabase = await createClient()
  await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${appUrl}/redefinir-senha` })

  return NextResponse.json({ ok: true, mensagem: MENSAGEM_GENERICA })
}
