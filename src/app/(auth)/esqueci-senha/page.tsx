'use client'

import { useState } from 'react'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [mensagem, setMensagem] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setMensagem('')
    setEnviando(true)

    const res = await fetch('/api/esqueci-senha', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error || 'Erro ao enviar o link de redefinição.')
      setEnviando(false)
      return
    }

    setMensagem(json.mensagem)
    setEnviando(false)
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f7fc' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: '#0B081A', padding: '28px 40px 24px', textAlign: 'center' }}>
          <img src="/logo.png" alt="SCAL" style={{ width: 160, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          <div style={{ marginBottom: 24, textAlign: 'center' }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Esqueci minha senha</h1>
            <p style={{ fontSize: 14, color: '#64748b', margin: '6px 0 0' }}>Informe seu e-mail para receber o link de redefinição</p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="seu@email.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #d7dce4', borderRadius: 8, fontSize: 14, color: '#0B081A', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>

            {mensagem && (
              <div style={{ background: '#ecfdf3', border: '1px solid #bbf7d0', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#15803d' }}>
                {mensagem}
              </div>
            )}

            {erro && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              style={{ padding: '12px', background: enviando ? '#a5b4fc' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', marginTop: 4 }}
            >
              {enviando ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>

            <p style={{ textAlign: 'center', fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              <a href="/login" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>Voltar ao login</a>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
