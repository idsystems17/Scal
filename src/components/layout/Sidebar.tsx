'use client'

import { Icon } from '@/components/dashboard/Icon'

type Role = 'parceiro' | 'cliente' | 'admin'

interface NavItem {
  label: string
  icon: string
  badge?: string | number
  active?: boolean
}

const navByRole: Record<Role, NavItem[]> = {
  parceiro: [
    { label: 'Visão geral', icon: 'grid', active: true },
    { label: 'Meus links', icon: 'link' },
    { label: 'Conversões', icon: 'cart', badge: '214' },
    { label: 'Comissões', icon: 'wallet' },
    { label: 'Materiais', icon: 'box' },
    { label: 'Suporte', icon: 'support' },
  ],
  cliente: [
    { label: 'Dashboard', icon: 'grid', active: true },
    { label: 'Parceiros', icon: 'users', badge: '58' },
    { label: 'Vendas', icon: 'cart' },
    { label: 'Canais', icon: 'chart' },
    { label: 'Integrações', icon: 'plug' },
    { label: 'Configurações', icon: 'gear' },
  ],
  admin: [
    { label: 'Overview', icon: 'grid', active: true },
    { label: 'Alertas de plano', icon: 'alert', badge: '7' },
    { label: 'Lojas ativas', icon: 'server' },
    { label: 'Segurança', icon: 'shield' },
    { label: 'Infraestrutura', icon: 'chart' },
    { label: 'Financeiro', icon: 'wallet' },
  ],
}

const roleLabels: Record<Role, string> = {
  parceiro: 'Área do Parceiro',
  cliente: 'Dashboard Lojista',
  admin: 'Admin SCAL',
}

interface SidebarProps {
  role: Role
}

export function Sidebar({ role }: SidebarProps) {
  const items = navByRole[role]

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
      <div style={{ padding: '24px 20px 20px', borderBottom: '1px solid #f1f5f9' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 11,
              background: 'linear-gradient(135deg, #2563eb, #1e40af)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: 18,
              letterSpacing: '-1px',
            }}
          >
            S
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>SCAL</p>
            <p style={{ fontSize: 11, color: '#94a3b8', margin: 0 }}>{roleLabels[role]}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {items.map((item, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 12px',
                borderRadius: 10,
                cursor: 'pointer',
                background: item.active ? '#eff4ff' : 'transparent',
                color: item.active ? '#1d4ed8' : '#64748b',
                transition: 'all 0.15s',
              }}
            >
              <Icon name={item.icon} size={18} />
              <span style={{ fontSize: 14, fontWeight: item.active ? 600 : 400, flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    padding: '2px 7px',
                    borderRadius: 20,
                    fontSize: 11,
                    fontWeight: 700,
                    background: item.active ? '#dbeafe' : '#f1f5f9',
                    color: item.active ? '#1d4ed8' : '#64748b',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Help Card */}
      <div style={{ padding: '12px' }}>
        <div
          style={{
            padding: '16px',
            borderRadius: 14,
            background: 'linear-gradient(135deg, #1e3a8a, #2563eb)',
            color: 'white',
          }}
        >
          <p style={{ fontSize: 13, fontWeight: 700, margin: '0 0 4px' }}>Precisa de ajuda?</p>
          <p style={{ fontSize: 11, opacity: 0.8, margin: '0 0 12px', lineHeight: 1.5 }}>
            Acesse nossa central de suporte e documentação
          </p>
          <button
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: 8,
              background: 'white',
              color: '#1d4ed8',
              border: 'none',
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Central de ajuda
          </button>
        </div>
      </div>
    </aside>
  )
}
