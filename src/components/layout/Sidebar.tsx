'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Icon } from '@/components/dashboard/Icon'

type Role = 'parceiro' | 'cliente' | 'admin'

const helpHrefByRole: Record<Role, string> = {
  parceiro: '/minha-area/suporte',
  cliente: '/dashboard/suporte',
  admin: '/admin/suporte',
}

interface NavItem {
  label: string
  icon: string
  href: string
  exact?: boolean
  badgeKey?: string
}

const navByRole: Record<Role, NavItem[]> = {
  parceiro: [
    { label: 'Visão geral', icon: 'grid', href: '/minha-area', exact: true },
    { label: 'Meus links', icon: 'link', href: '/minha-area/links' },
    { label: 'Conversões', icon: 'cart', href: '/minha-area/conversoes', badgeKey: 'conversoes' },
    { label: 'Comissões', icon: 'wallet', href: '/minha-area/comissoes' },
    { label: 'Materiais', icon: 'box', href: '/minha-area/materiais' },
    { label: 'Suporte', icon: 'support', href: '/minha-area/suporte' },
  ],
  cliente: [
    { label: 'Dashboard', icon: 'grid', href: '/dashboard', exact: true },
    { label: 'Parceiros', icon: 'users', href: '/dashboard/parceiros', badgeKey: 'parceiros' },
    { label: 'Vendas', icon: 'cart', href: '/dashboard/vendas' },
    { label: 'Canais', icon: 'chart', href: '/dashboard/canais' },
    { label: 'Materiais', icon: 'box', href: '/dashboard/materiais' },
    { label: 'Integrações', icon: 'plug', href: '/dashboard/integracoes' },
    { label: 'Configurações', icon: 'gear', href: '/dashboard/configuracoes' },
    { label: 'Suporte', icon: 'support', href: '/dashboard/suporte' },
  ],
  admin: [
    { label: 'Home', icon: 'grid', href: '/admin', exact: true },
    { label: 'Infraestrutura', icon: 'chart', href: '/admin/infraestrutura' },
    { label: 'Financeiro', icon: 'wallet', href: '/admin/financeiro' },
    { label: 'E-commerces', icon: 'server', href: '/admin/lojas' },
    { label: 'Integração', icon: 'plug', href: '/admin/integracao' },
    { label: 'Materiais', icon: 'box', href: '/admin/materiais' },
    { label: 'Alertas de plano', icon: 'alert', href: '/admin/alertas', badgeKey: 'alertas' },
    { label: 'Segurança', icon: 'shield', href: '/admin/seguranca' },
    { label: 'Suporte', icon: 'support', href: '/admin/suporte' },
  ],
}

const roleLabels: Record<Role, string> = {
  parceiro: 'Área do Parceiro',
  cliente: 'Dashboard E-commerce',
  admin: '',
}

interface SidebarProps {
  role: Role
  counts?: Record<string, number>
  logoUrl?: string | null
}

export function Sidebar({ role, counts = {}, logoUrl }: SidebarProps) {
  const pathname = usePathname()
  const items = navByRole[role]

  function isActive(item: NavItem) {
    if (item.exact) return pathname === item.href
    return pathname.startsWith(item.href)
  }

  return (
    <aside
      style={{
        width: 246,
        minWidth: 246,
        height: '100vh',
        background: 'white',
        borderRight: '1px solid #e9eef6',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
        overflowY: 'auto',
      }}
    >
      {/* Logo */}
      <div style={{ background: '#0B081A', padding: '16px 20px', borderBottom: '1px solid #1e1e2e' }}>
        <img src={logoUrl || '/logo.png'} alt="SCAL" style={{ width: '100%', maxWidth: 160, objectFit: 'contain', display: 'block' }} />
        {roleLabels[role] && (
          <p style={{ fontSize: 11, color: '#9B6AFF', margin: '6px 0 0', fontWeight: 600, letterSpacing: '0.5px' }}>{roleLabels[role]}</p>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item) => {
            const active = isActive(item)
            const badge = item.badgeKey ? counts[item.badgeKey] : undefined
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 12px',
                  borderRadius: 10,
                  cursor: 'pointer',
                  background: active ? '#eff4ff' : 'transparent',
                  color: active ? '#1d4ed8' : '#64748b',
                  transition: 'all 0.15s',
                  textDecoration: 'none',
                  fontFamily: 'inherit',
                }}
              >
                <Icon name={item.icon} size={18} />
                <span style={{ fontSize: 14, fontWeight: active ? 600 : 400, flex: 1 }}>{item.label}</span>
                {badge !== undefined && badge > 0 && (
                  <span
                    style={{
                      padding: '2px 7px',
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 700,
                      background: active ? '#dbeafe' : '#f1f5f9',
                      color: active ? '#1d4ed8' : '#64748b',
                    }}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Help Card */}
      <div style={{ padding: '12px' }}>
        <div style={{ padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #1e3a8a, #2563eb)', color: 'white' }}>
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Precisa de ajuda?</p>
          <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 12px', lineHeight: 1.5 }}>
            Acesse nossa central de suporte e documentação
          </p>
          <Link
            href={helpHrefByRole[role]}
            style={{ display: 'block', width: '100%', padding: '8px', borderRadius: 8, background: 'white', color: '#1d4ed8', border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
          >
            Central de ajuda
          </Link>
        </div>
      </div>
    </aside>
  )
}
