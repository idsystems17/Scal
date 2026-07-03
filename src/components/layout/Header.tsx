'use client'

import { useState } from 'react'
import { Icon } from '@/components/dashboard/Icon'

interface HeaderProps {
  title: string
  subtitle: string
  userName?: string
}

export function Header({ title, subtitle, userName = 'MA' }: HeaderProps) {
  const [period, setPeriod] = useState<7 | 30 | 90>(30)

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 10,
        background: 'rgba(244, 247, 252, 0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e9eef6',
        padding: '16px 32px',
        display: 'flex',
        alignItems: 'center',
        gap: 20,
      }}
    >
      {/* Title */}
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{subtitle}</p>
      </div>

      {/* Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 14px',
          borderRadius: 10,
          background: 'white',
          border: '1px solid #e6ecf5',
          color: '#94a3b8',
          minWidth: 180,
        }}
      >
        <Icon name="search" size={15} />
        <span style={{ fontSize: 13 }}>Buscar...</span>
      </div>

      {/* Period selector */}
      <div
        style={{
          display: 'flex',
          background: 'white',
          border: '1px solid #e6ecf5',
          borderRadius: 10,
          padding: 3,
          gap: 2,
        }}
      >
        {([7, 30, 90] as const).map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            style={{
              padding: '6px 12px',
              borderRadius: 7,
              border: 'none',
              background: period === p ? '#2563eb' : 'transparent',
              color: period === p ? 'white' : '#64748b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {p} dias
          </button>
        ))}
      </div>

      {/* Bell */}
      <div style={{ position: 'relative', cursor: 'pointer' }}>
        <div style={{ padding: 8, borderRadius: 10, background: 'white', border: '1px solid #e6ecf5', color: '#64748b', display: 'flex' }}>
          <Icon name="bell" size={18} />
        </div>
        <span
          style={{
            position: 'absolute',
            top: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: '#e11d48',
            border: '2px solid #f4f7fc',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: 'white',
          }}
        >
          3
        </span>
      </div>

      {/* Avatar */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: 'white',
          cursor: 'pointer',
          flexShrink: 0,
        }}
      >
        {userName}
      </div>
    </header>
  )
}
