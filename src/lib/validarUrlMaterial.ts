export function validarUrlMaterial(url: string): string {
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    throw new Error('Link inválido.')
  }
  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw new Error('O link precisa começar com http:// ou https://.')
  }
  return url
}
