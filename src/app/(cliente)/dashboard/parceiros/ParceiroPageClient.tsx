'use client'

import { useState } from 'react'
import { PartnersTable } from '@/components/dashboard/PartnersTable'
import { ConviteModal } from '@/components/dashboard/ConviteModal'
import { Icon } from '@/components/dashboard/Icon'

interface Partner {
  id: string
  nome: string
  codigo: string
  clicks: number
  sales: number
  revenue: number
  status: 'top' | 'ativo' | 'baixa_conversao' | 'inativo' | 'bloqueado'
  statusReal: 'ativo' | 'pendente' | 'bloqueado'
}

interface Props {
  clienteId: string
  parceiros: Partner[]
}

export default function ParceiroPageClient({ clienteId, parceiros }: Props) {
  const [modal, setModal] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {modal && <ConviteModal clienteId={clienteId} onClose={() => setModal(false)} />}

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Parceiros</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Gerencie seus afiliados e convide novos</p>
        </div>
        <button
          onClick={() => setModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: 'white', border: 'none', borderRadius: 10,
            fontSize: 14, fontWeight: 600, cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}
        >
          <Icon name="plus" size={16} />
          Convidar parceiro
        </button>
      </div>

      <PartnersTable parceiros={parceiros} />
    </div>
  )
}
