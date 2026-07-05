import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  const { data: convite } = await adminClient
    .from('convites')
    .select('usado, expires_at')
    .eq('token', token)
    .maybeSingle()

  const valido = !!convite && !convite.usado && new Date(convite.expires_at) > new Date()

  return NextResponse.json({ valido })
}
