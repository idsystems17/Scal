'use client'

import { useRouter, usePathname } from 'next/navigation'

const roles = [
  { label: 'Parceiro', path: '/minha-area' },
  { label: 'Cliente', path: '/dashboard' },
  { label: 'Admin', path: '/admin' },
]

export function DevRoleSwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  if (process.env.NODE_ENV !== 'development') return null

  const currentRole = roles.find(r => pathname.startsWith(r.path))

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 9999,
        background: '#0B081A',
        border: '1px solid #334155',
        borderRadius: 12,
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
      }}
    >
      <p style={{ fontSize: 10, color: '#64748b', margin: 0, fontWeight: 700, letterSpacing: '0.08em' }}>
        DEV — TROCAR ROLE
      </p>
      <div style={{ display: 'flex', gap: 4 }}>
        {roles.map(role => (
          <button
            key={role.path}
            onClick={() => router.push(role.path)}
            style={{
              padding: '5px 10px',
              borderRadius: 7,
              border: 'none',
              background: currentRole?.path === role.path ? '#2563eb' : '#1e293b',
              color: currentRole?.path === role.path ? 'white' : '#94a3b8',
              fontSize: 11,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {role.label}
          </button>
        ))}
      </div>
    </div>
  )
}
