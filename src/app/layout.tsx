import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { DevRoleSwitcher } from '@/components/layout/DevRoleSwitcher'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

export const metadata: Metadata = {
  title: 'SCAL — Rastreamento de Afiliados',
  description: 'SaaS multi-tenant de rastreamento de vendas por afiliado',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={plusJakartaSans.variable} style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif', background: '#f4f7fc', margin: 0 }}>
        {children}
        <DevRoleSwitcher />
      </body>
    </html>
  )
}
