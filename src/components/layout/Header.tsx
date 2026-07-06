'use client'

import { useState, useTransition, useRef, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Icon } from '@/components/dashboard/Icon'
import { createClient } from '@/lib/supabase/client'

export interface Notification {
  id: string
  title: string
  text: string
  time: string
  type: 'alert' | 'info' | 'success'
  href?: string
}

interface HeaderProps {
  title: string
  subtitle: string
  titleColor?: string
  userName?: string
  notifications?: Notification[]
}

function HeaderControls({ notifications = [] }: { notifications: Notification[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [bellOpen, setBellOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(searchParams.get('q') ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const currentPeriod = Number(searchParams.get('period') ?? 30)

  function pushParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`)
    })
  }

  function handleSearch(value: string) {
    setSearchValue(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => pushParam('q', value), 350)
  }

  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  useEffect(() => {
    const urlQ = searchParams.get('q') ?? ''
    if (urlQ !== searchValue) setSearchValue(urlQ)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <>
      {/* Search */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '8px 14px', borderRadius: 10,
        background: 'white', border: '1px solid #e6ecf5', minWidth: 200,
      }}>
        <Icon name="search" size={15} />
        <input
          type="text"
          value={searchValue}
          onChange={e => handleSearch(e.target.value)}
          placeholder="Buscar..."
          style={{
            border: 'none', outline: 'none', background: 'transparent',
            fontSize: 13, color: '#0B081A', width: '100%', fontFamily: 'inherit',
          }}
        />
        {searchValue && (
          <button
            onClick={() => handleSearch('')}
            style={{ border: 'none', background: 'none', cursor: 'pointer', color: '#94a3b8', padding: 0, lineHeight: 1, fontSize: 16 }}
          >
            ×
          </button>
        )}
      </div>

      {/* Period */}
      <div style={{ display: 'flex', background: 'white', border: '1px solid #e6ecf5', borderRadius: 10, padding: 3, gap: 2 }}>
        {([
          { value: 7, label: '7d' },
          { value: 30, label: '30d' },
          { value: 90, label: '90d' },
          { value: 180, label: '6m' },
          { value: 365, label: '1a' },
        ] as const).map(({ value, label }) => (
          <button
            key={value}
            onClick={() => pushParam('period', String(value))}
            style={{
              padding: '6px 12px', borderRadius: 7, border: 'none',
              background: currentPeriod === value ? '#2563eb' : 'transparent',
              color: currentPeriod === value ? 'white' : '#64748b',
              fontSize: 12, fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Bell */}
      <div style={{ position: 'relative' }}>
        <div
          onClick={() => setBellOpen(v => !v)}
          style={{ padding: 8, borderRadius: 10, background: 'white', border: '1px solid #e6ecf5', color: '#64748b', display: 'flex', cursor: 'pointer', position: 'relative' }}
        >
          <Icon name="bell" size={18} />
          {notifications.length > 0 && (
            <span style={{
              position: 'absolute', top: -4, right: -4,
              width: 16, height: 16, borderRadius: '50%',
              background: '#e11d48', border: '2px solid #f4f7fc',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9, fontWeight: 700, color: 'white',
            }}>
              {Math.min(notifications.length, 9)}
            </span>
          )}
        </div>

        {bellOpen && (
          <>
            <div onClick={() => setBellOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
            <div style={{
              position: 'absolute', right: 0, top: 46,
              background: 'white', border: '1px solid #e6ecf5',
              borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              overflow: 'hidden', minWidth: 300, maxWidth: 360, zIndex: 50,
            }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: '#0B081A' }}>Notificações</span>
              </div>
              {notifications.length === 0 ? (
                <div style={{ padding: '24px 16px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                  Nenhuma notificação
                </div>
              ) : (
                <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => { setBellOpen(false); if (n.href) router.push(n.href) }}
                      style={{
                        padding: '12px 16px', borderBottom: '1px solid #f8fafc',
                        cursor: n.href ? 'pointer' : 'default',
                        display: 'flex', gap: 10, alignItems: 'flex-start',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f8fafc')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', flexShrink: 0, marginTop: 5,
                        background: n.type === 'alert' ? '#e11d48' : n.type === 'success' ? '#16a34a' : '#9B6AFF',
                      }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#0B081A', lineHeight: 1.3 }}>{n.title}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{n.text}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: '#94a3b8' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}

function Avatar({ userName }: { userName: string }) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ position: 'relative' }}>
      <div
        onClick={() => setMenuOpen(v => !v)}
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: 'linear-gradient(135deg, #2563eb, #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: 'white',
          cursor: 'pointer', flexShrink: 0, userSelect: 'none',
        }}
      >
        {userName}
      </div>
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 40 }} />
          <div style={{
            position: 'absolute', right: 0, top: 46,
            background: 'white', border: '1px solid #e6ecf5',
            borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden', minWidth: 140, zIndex: 50,
          }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%', padding: '10px 16px',
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 13, color: '#dc2626', fontWeight: 600,
              }}
            >
              <Icon name="logout" size={15} />
              Sair
            </button>
          </div>
        </>
      )}
    </div>
  )
}

export function Header({ title, subtitle, titleColor = '#0B081A', userName = 'US', notifications = [] }: HeaderProps) {
  return (
    <header style={{
      position: 'sticky', top: 0, zIndex: 10,
      background: 'rgba(244, 247, 252, 0.85)',
      backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
      borderBottom: '1px solid #e9eef6', padding: '16px 32px',
      display: 'flex', alignItems: 'center', gap: 16,
    }}>
      <div style={{ flex: 1 }}>
        <h1 style={{ fontSize: 20, fontWeight: 800, color: titleColor, margin: 0, letterSpacing: '-0.5px' }}>{title}</h1>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '2px 0 0' }}>{subtitle}</p>
      </div>
      <Suspense fallback={<div style={{ width: 420, height: 36 }} />}>
        <HeaderControls notifications={notifications} />
      </Suspense>
      <Avatar userName={userName} />
    </header>
  )
}
