import { AjudaChat } from '@/components/dashboard/AjudaChat'
import { FAQ_CLIENTE } from '@/lib/faq'

export default function SuportePage() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Central de ajuda</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Tire suas dúvidas sobre webhook, parceiros e planos</p>
      </div>
      <AjudaChat role="cliente" faq={FAQ_CLIENTE} />
    </div>
  )
}
