import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined

  if (role === 'admin') redirect('/admin')
  if (role === 'cliente') redirect('/dashboard')
  if (role === 'parceiro') redirect('/minha-area')
  redirect('/login')
}
