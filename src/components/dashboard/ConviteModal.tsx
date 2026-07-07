'use client'

import { useState } from 'react'
import { Icon } from './Icon'

interface ConviteModalProps {
  clienteId: string
  onClose: () => void
}

export function ConviteModal({ clienteId, onClose }: ConviteModalProps) {
  const [email, setEmail] = useState('')
  const [link, setLink] = useState('')
  const [copiado, setCopiado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  async function handleGerar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const res = await fetch('/api/criar-convite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clienteId, email: email || undefined }),
    })

    const json = await res.json()
    if (!res.ok) {
      setErro(json.error || 'Erro ao gerar convite.')
      setCarregando(false)
      return
    }

    setLink(json.link)
    setCarregando(false)
  }

  function handleCopiar() {
    navigator.clipboard.writeText(link).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100, backdropFilter: 'blur(2px)' }}
      />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        background: 'white', borderRadius: 16, padding: '32px',
        width: '100%', maxWidth: 460,
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        zIndex: 101,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0B081A', margin: 0 }}>Convidar parceiro</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>O link expira em 7 dias</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {!link ? (
          <form onSubmit={handleGerar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>
                Email do parceiro <span style={{ color: '#94a3b8', fontWeight: 400 }}>(opcional)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="parceiro@email.com"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '6px 0 0' }}>
                Se informado, o parceiro só poderá cadastrar com esse email.
              </p>
            </div>

            {erro && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              style={{ padding: '12px', background: carregando ? '#a5b4fc' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer' }}
            >
              {carregando ? 'Gerando...' : 'Gerar link de convite'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={16} />
              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>Link gerado com sucesso!</span>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Link de convite</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  readOnly
                  value={link}
                  style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 12, color: '#475569', background: '#f8fafc', fontFamily: 'monospace', outline: 'none' }}
                />
                <button
                  onClick={handleCopiar}
                  style={{ padding: '10px 16px', background: copiado ? '#ecfdf3' : 'white', border: `1.5px solid ${copiado ? '#bbf7d0' : '#c0c5cc'}`, borderRadius: 8, cursor: 'pointer', color: copiado ? '#16a34a' : '#475569', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
                >
                  <Icon name={copiado ? 'check' : 'copy'} size={14} />
                  {copiado ? 'Copiado!' : 'Copiar'}
                </button>
              </div>
            </div>

            <button
              onClick={() => { setLink(''); setEmail('') }}
              style={{ padding: '10px', background: 'none', border: '1px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#64748b', cursor: 'pointer' }}
            >
              Gerar outro convite
            </button>
          </div>
        )}
      </div>
    </>
  )
}
