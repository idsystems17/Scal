import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function proxy(req: NextRequest) {
  const res = NextResponse.next()

  // Em desenvolvimento sem credenciais Supabase configuradas, permite acesso direto
  if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('.supabase.co')) {
    return res
  }

  // Também bypassar se URL for placeholder
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  if (process.env.NODE_ENV === 'development' && supabaseUrl.includes('placeholder')) {
    return res
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => req.cookies.getAll(),
        setAll: (cookiesToSet) =>
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          ),
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  const path = req.nextUrl.pathname

  const isPublic =
    path.startsWith('/login') ||
    path.startsWith('/cadastro') ||
    path.startsWith('/r/') ||
    path.startsWith('/webhook/') ||
    path.startsWith('/convite/') ||
    path.startsWith('/api/') ||
    path.startsWith('/politica-privacidade') ||
    path.startsWith('/termos-de-uso') ||
    path.startsWith('/esqueci-senha') ||
    path.startsWith('/redefinir-senha')

  if (isPublic) return res

  if (!user) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  if (path.startsWith('/admin') && role !== 'admin') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (path.startsWith('/dashboard') && role !== 'cliente') {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (path.startsWith('/minha-area') && role !== 'parceiro') {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$|.*\\.webp$|.*\\.ico$|.*\\.js$).*)'],
}
