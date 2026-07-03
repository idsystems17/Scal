'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha })

    if (error || !data.user) {
      setErro('Email ou senha inválidos.')
      setCarregando(false)
      return
    }

    const role = data.user.user_metadata?.role as string | undefined
    if (role === 'admin') router.push('/admin')
    else if (role === 'cliente') router.push('/dashboard')
    else router.push('/minha-area')
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f4f7fc',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        padding: '48px 40px',
        width: '100%',
        maxWidth: 400,
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
      }}>
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <img src="/logo.svg" alt="SCAL" style={{ width: 72, height: 72, objectFit: 'contain', margin: '0 auto 16px', display: 'block' }} />
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0 }}>Entrar no SCAL</h1>
          <p style={{ fontSize: 14, color: '#64748b', margin: '8px 0 0' }}>Acesse sua conta</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
              Senha
            </label>
            <input
              type="password"
              required
              value={senha}
              onChange={e => setSenha(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '1.5px solid #e2e8f0',
                borderRadius: 8,
                fontSize: 14,
                color: '#0f172a',
                outline: 'none',
                boxSizing: 'border-box',
                background: '#f8fafc',
              }}
            />
          </div>

          {erro && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: 8,
              padding: '10px 14px',
              fontSize: 13,
              color: '#dc2626',
            }}>
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            style={{
              padding: '12px',
              background: carregando ? '#a5b4fc' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: carregando ? 'not-allowed' : 'pointer',
              marginTop: 4,
            }}
          >
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
