'use client'

import { useState } from 'react'
import { NovoClienteModal } from './NovoClienteModal'

export function NovoClienteButton() {
  const [aberto, setAberto] = useState(false)

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        style={{
          padding: '10px 16px', borderRadius: 8, border: 'none',
          background: 'linear-gradient(135deg, #9B6AFF, #C2A4FF)',
          color: 'white', fontWeight: 600, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        + Cadastrar e-commerce
      </button>
      {aberto && <NovoClienteModal onClose={() => setAberto(false)} />}
    </>
  )
}
