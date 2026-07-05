'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Icon } from './Icon'

export interface Material {
  id: string
  titulo: string
  url: string
  criado_em: string
}

interface MateriaisManagerProps {
  titulo: string
  subtitulo: string
  materiais: Material[]
  onCreate?: (titulo: string, url: string) => Promise<void>
  onDelete?: (id: string) => Promise<void>
  emptyText?: string
}

export function MateriaisManager({ titulo, subtitulo, materiais, onCreate, onDelete, emptyText }: MateriaisManagerProps) {
  const [tituloInput, setTituloInput] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [erro, setErro] = useState('')
  const [pending, startTransition] = useTransition()
  const [excluindo, setExcluindo] = useState<string | null>(null)
  const router = useRouter()

  const canManage = Boolean(onCreate)

  function handleAdd() {
    if (!tituloInput.trim() || !urlInput.trim()) {
      setErro('Preencha título e link.')
      return
    }
    let parsed: URL
    try {
      parsed = new URL(urlInput.trim())
    } catch {
      setErro('Informe um link válido (com https://).')
      return
    }
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      setErro('O link precisa começar com http:// ou https://.')
      return
    }
    setErro('')
    startTransition(async () => {
      try {
        await onCreate!(tituloInput.trim(), urlInput.trim())
      } catch {
        setErro('Não foi possível salvar o material. Verifique o link e tente novamente.')
        return
      }
      setTituloInput('')
      setUrlInput('')
      router.refresh()
    })
  }

  function handleDelete(id: string) {
    setExcluindo(id)
    startTransition(async () => {
      await onDelete!(id)
      router.refresh()
      setExcluindo(null)
    })
  }

  return (
    <div style={{ background: 'white', border: '1px solid #e6ecf5', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0f172a', margin: 0 }}>{titulo}</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0' }}>{subtitulo}</p>
      </div>

      {canManage && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
          <input
            value={tituloInput}
            onChange={e => setTituloInput(e.target.value)}
            placeholder="Título do material"
            style={{ flex: '1 1 180px', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', outline: 'none' }}
          />
          <input
            value={urlInput}
            onChange={e => setUrlInput(e.target.value)}
            placeholder="Link (Google Drive, Dropbox, etc.)"
            style={{ flex: '2 1 260px', padding: '9px 12px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 13, color: '#0f172a', outline: 'none' }}
          />
          <button
            onClick={handleAdd}
            disabled={pending}
            style={{
              padding: '9px 16px', borderRadius: 8, border: 'none',
              background: pending ? '#e2e8f0' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: pending ? '#94a3b8' : 'white', fontWeight: 600, fontSize: 13,
              cursor: pending ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
            }}
          >
            Adicionar
          </button>
        </div>
      )}
      {erro && <p style={{ fontSize: 12, color: '#dc2626', margin: '-12px 0 16px' }}>{erro}</p>}

      {materiais.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8' }}>
          <p style={{ fontSize: 14, fontWeight: 600, margin: 0 }}>{emptyText ?? 'Nenhum material ainda.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {materiais.map(m => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eef4ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="link" size={16} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', margin: 0 }}>{m.titulo}</p>
                <a href={m.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: '#2563eb', textDecoration: 'none' }}>
                  Abrir material ↗
                </a>
              </div>
              {onDelete && (
                <button
                  onClick={() => handleDelete(m.id)}
                  disabled={excluindo === m.id}
                  style={{
                    padding: '6px 12px', borderRadius: 8, border: '1px solid #fecdd3',
                    background: '#fff1f3', color: '#e11d48', fontSize: 12, fontWeight: 500,
                    cursor: excluindo === m.id ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap',
                  }}
                >
                  {excluindo === m.id ? '...' : 'Remover'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
