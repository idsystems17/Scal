import { createHash } from 'crypto'

const SALT = process.env.WEBHOOK_HMAC_SALT || 'change-me-in-production'

export function hashIP(ip: string): string {
  return createHash('sha256').update(ip + SALT).digest('hex').slice(0, 16)
}
