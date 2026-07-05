import { adminClient } from '@/lib/supabase/admin'

export async function checkRateLimit(key: string, limit: number, windowMs: number): Promise<boolean> {
  const { data, error } = await adminClient.rpc('checar_rate_limit', {
    p_chave: key,
    p_limite: limit,
    p_janela_segundos: Math.ceil(windowMs / 1000),
  })

  if (error) {
    console.error('rate_limit_check_falhou', key, error.message)
    return true
  }

  return data === true
}
