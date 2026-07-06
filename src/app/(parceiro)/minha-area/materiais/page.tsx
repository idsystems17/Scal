import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMateriaisParceiro } from '@/lib/actions/parceiro'
import { MateriaisManager } from '@/components/dashboard/MateriaisManager'

export default async function ParceiroMateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: parceiro } = await supabase
    .from('parceiros')
    .select('id, cliente_id, clientes(nome_loja)')
    .eq('user_id', user.id)
    .single()

  if (!parceiro) redirect('/minha-area')

  const nomeLoja = (Array.isArray(parceiro.clientes) ? parceiro.clientes[0] : parceiro.clientes as { nome_loja: string } | null)?.nome_loja ?? 'seu e-commerce'

  const todos = await getMateriaisParceiro()
  const globais = todos.filter(m => m.cliente_id === null)
  const daEmpresa = todos.filter(m => m.cliente_id === parceiro.cliente_id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Materiais</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Banners, imagens e criativos para divulgação</p>
      </div>

      <MateriaisManager
        titulo={`Materiais de ${nomeLoja}`}
        subtitulo="Fornecidos pelo e-commerce que você representa"
        materiais={daEmpresa}
        emptyText="O e-commerce ainda não cadastrou materiais."
      />

      <MateriaisManager
        titulo="Materiais do SCAL"
        subtitulo="Disponíveis para todos os parceiros da plataforma"
        materiais={globais}
        emptyText="Nenhum material global disponível ainda."
      />
    </div>
  )
}
