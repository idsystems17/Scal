import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/security/ratelimit'
import { hashIP } from '@/lib/security/hash'

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'

  if (!(await checkRateLimit(`login:${hashIP(ip)}`, 10, 15 * 60_000))) {
    return NextResponse.json({ error: 'Muitas tentativas. Tente novamente em alguns minutos.' }, { status: 429 })
  }

  const { email, senha } = await req.json()
  if (!email || !senha) {
    return NextResponse.json({ error: 'Email ou senha inválidos.' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

  if (error || !data.user) {
    return NextResponse.json({ error: 'Email ou senha inválidos.' }, { status: 401 })
  }

  const role = data.user.user_metadata?.role as string | undefined
  return NextResponse.json({ ok: true, role })
}
