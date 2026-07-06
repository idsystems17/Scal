const PADRAO_ID = [
  /drive\.google\.com\/file\/d\/([^/?]+)/,
  /drive\.google\.com\/open\?id=([^&]+)/,
  /drive\.google\.com\/uc\?id=([^&]+)/,
]

export function extrairIdGoogleDrive(url: string): string | null {
  for (const padrao of PADRAO_ID) {
    const match = url.match(padrao)
    if (match) return match[1]
  }
  return null
}

export function urlEmbedGoogleDrive(url: string): string | null {
  const id = extrairIdGoogleDrive(url)
  return id ? `https://drive.google.com/file/d/${id}/preview` : null
}
