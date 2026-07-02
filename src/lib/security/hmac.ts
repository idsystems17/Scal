import { createHmac } from 'crypto'

export function validateWebhookSignature(
  rawBody: string,
  receivedSignature: string,
  secret: string
): boolean {
  const expected = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')
  return timingSafeEqual(expected, receivedSignature)
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}
