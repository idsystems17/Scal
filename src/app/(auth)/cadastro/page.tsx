'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CadastroPage() {
  const router = useRouter()
  const [nomeLoja, setNomeLoja] = useState('')
  const [urlLoja, setUrlLoja] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [aceite, setAceite] = useState(false)

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (!aceite) {
      setErro('Você precisa aceitar os Termos de Uso e a Política de Privacidade para continuar.')
      return
    }

    setCarregando(true)

    const res = await fetch('/api/cadastrar-cliente', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nomeLoja, urlLoja, email, senha, aceiteTermos: aceite }),
    })

    const json = await res.json()

    if (!res.ok) {
      setErro(json.error || 'Erro ao criar conta.')
      setCarregando(false)
      return
    }

    router.push('/login?cadastro=ok')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f7fc' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 440, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: '#0B081A', padding: '28px 40px 24px', textAlign: 'center' }}>
          <img src="/logo.png" alt="SCAL" style={{ width: 160, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Criar conta de e-commerce</h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0' }}>Configure seu e-commerce no SCAL</p>
          </div>

          <form onSubmit={handleCadastro} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Nome do e-commerce', value: nomeLoja, set: setNomeLoja, type: 'text', placeholder: 'Ex: Loja da Maria' },
              { label: 'URL do site', value: urlLoja, set: setUrlLoja, type: 'url', placeholder: 'https://suaempresa.com.br' },
              { label: 'Email', value: email, set: setEmail, type: 'email', placeholder: 'seu@email.com' },
              { label: 'Senha', value: senha, set: setSenha, type: 'password', placeholder: 'Mínimo 8 caracteres' },
            ].map(({ label, value, set, type, placeholder }) => (
              <div key={label}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>{label}</label>
                <input
                  type={type}
                  required
                  minLength={type === 'password' ? 8 : undefined}
                  value={value}
                  onChange={e => set(e.target.value)}
                  placeholder={placeholder}
                  style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d7dce4', borderRadius: 8, fontSize: 14, color: '#0B081A', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                />
              </div>
            ))}

            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: '#374151', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={aceite}
                onChange={e => setAceite(e.target.checked)}
                style={{ marginTop: 2 }}
              />
              <span>
                Li e concordo com os{' '}
                <a href="/termos-de-uso" target="_blank" rel="noopener noreferrer" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>Termos de Uso</a>
                {' '}e a{' '}
                <a href="/politica-privacidade" target="_blank" rel="noopener noreferrer" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>Política de Privacidade</a>
              </span>
            </label>

            {erro && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              style={{ padding: '12px', background: carregando ? '#a5b4fc' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer', marginTop: 4 }}
            >
              {carregando ? 'Criando conta...' : 'Criar conta'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              Já tem conta?{' '}
              <a href="/login" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>Entrar</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
