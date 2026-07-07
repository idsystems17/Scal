'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { criarClienteManual } from '@/lib/actions/admin'
import { Icon } from './Icon'

interface NovoClienteModalProps {
  onClose: () => void
}

export function NovoClienteModal({ onClose }: NovoClienteModalProps) {
  const [nomeLoja, setNomeLoja] = useState('')
  const [urlLoja, setUrlLoja] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'trial' | 'ativo'>('trial')
  const [credenciais, setCredenciais] = useState<{ email: string; senha: string } | null>(null)
  const [copiado, setCopiado] = useState(false)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const router = useRouter()

  async function handleCriar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)
    try {
      const resultado = await criarClienteManual(nomeLoja, urlLoja, email, status)
      setCredenciais(resultado)
      router.refresh()
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar e-commerce.')
    }
    setCarregando(false)
  }

  function handleCopiar() {
    if (!credenciais) return
    navigator.clipboard.writeText(`Email: ${credenciais.email}\nSenha: ${credenciais.senha}`).then(() => {
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2500)
    })
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 100, backdropFilter: 'blur(2px)' }}
      />

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
            <h2 style={{ fontSize: 17, fontWeight: 700, color: '#0B081A', margin: 0 }}>Cadastrar e-commerce</h2>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Cria a conta direto, sem precisar do link de cadastro</p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: 20, lineHeight: 1, padding: 4 }}>×</button>
        </div>

        {!credenciais ? (
          <form onSubmit={handleCriar} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nome do e-commerce</label>
              <input
                value={nomeLoja}
                onChange={e => setNomeLoja(e.target.value)}
                placeholder="Ex: Loja da Maria"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>URL do site</label>
              <input
                value={urlLoja}
                onChange={e => setUrlLoja(e.target.value)}
                placeholder="https://loja.com.br"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Email de acesso</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contato@loja.com.br"
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Status inicial</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as 'trial' | 'ativo')}
                style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, outline: 'none', background: '#f8fafc', color: '#0B081A' }}
              >
                <option value="trial">Trial</option>
                <option value="ativo">Ativo</option>
              </select>
            </div>

            {erro && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              style={{ padding: '12px', background: carregando ? '#c9b3ff' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)', color: 'white', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: carregando ? 'not-allowed' : 'pointer' }}
            >
              {carregando ? 'Cadastrando...' : 'Cadastrar e-commerce'}
            </button>
          </form>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Icon name="check" size={16} />
              <span style={{ fontSize: 13, color: '#15803d', fontWeight: 600 }}>E-commerce cadastrado com sucesso!</span>
            </div>

            <div style={{ background: '#f8fafc', border: '1px solid #c0c5cc', borderRadius: 10, padding: '16px' }}>
              <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 8px' }}>Envie esses dados de acesso pro e-commerce (essa senha não fica salva em lugar nenhum, anote agora):</p>
              <p style={{ fontSize: 13, color: '#0B081A', margin: '0 0 4px' }}><strong>Email:</strong> {credenciais.email}</p>
              <p style={{ fontSize: 13, color: '#0B081A', margin: 0, fontFamily: 'monospace' }}><strong style={{ fontFamily: 'inherit' }}>Senha:</strong> {credenciais.senha}</p>
            </div>

            <button
              onClick={handleCopiar}
              style={{ padding: '10px 16px', background: copiado ? '#ecfdf3' : 'white', border: `1.5px solid ${copiado ? '#bbf7d0' : '#c0c5cc'}`, borderRadius: 8, cursor: 'pointer', color: copiado ? '#16a34a' : '#475569', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
            >
              <Icon name={copiado ? 'check' : 'copy'} size={14} />
              {copiado ? 'Copiado!' : 'Copiar email e senha'}
            </button>

            <button
              onClick={onClose}
              style={{ padding: '10px', background: 'none', border: '1px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#64748b', cursor: 'pointer' }}
            >
              Fechar
            </button>
          </div>
        )}
      </div>
    </>
  )
}
