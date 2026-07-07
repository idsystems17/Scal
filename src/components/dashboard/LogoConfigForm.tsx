'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

interface LogoConfigFormProps {
  logoAtual: string | null
  onSalvar: (url: string) => Promise<void>
}

export function LogoConfigForm({ logoAtual, onSalvar }: LogoConfigFormProps) {
  const [urlInput, setUrlInput] = useState(logoAtual ?? '')
  const [erro, setErro] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [pending, startTransition] = useTransition()
  const router = useRouter()

  function handleSalvar() {
    setErro('')
    setSalvo(false)
    startTransition(async () => {
      try {
        await onSalvar(urlInput.trim())
      } catch {
        setErro('Não foi possível salvar. Verifique se o link é válido (com https://).')
        return
      }
      setSalvo(true)
      router.refresh()
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: 0 }}>Logo da plataforma</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>Cole o link de uma imagem (PNG/SVG) hospedada em qualquer lugar. Deixe em branco pra voltar à logo padrão do Scal.</p>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input
          value={urlInput}
          onChange={e => setUrlInput(e.target.value)}
          placeholder="https://…/logo.png"
          style={{ flex: '1 1 320px', padding: '9px 12px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 13, color: '#0B081A', outline: 'none' }}
        />
        <button
          onClick={handleSalvar}
          disabled={pending}
          style={{
            padding: '9px 16px', borderRadius: 8, border: 'none',
            background: pending ? '#e2e8f0' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)',
            color: pending ? '#94a3b8' : 'white', fontWeight: 600, fontSize: 13,
            cursor: pending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
          }}
        >
          {pending ? 'Salvando…' : 'Salvar'}
        </button>
      </div>
      {erro && <p style={{ fontSize: 12, color: '#dc2626', margin: '10px 0 0' }}>{erro}</p>}
      {salvo && !erro && <p style={{ fontSize: 12, color: '#16a34a', margin: '10px 0 0' }}>Logo atualizada.</p>}
    </div>
  )
}
