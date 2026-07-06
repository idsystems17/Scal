import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getMateriaisCliente, criarMaterialCliente, excluirMaterialCliente } from '@/lib/actions/cliente'
import { MateriaisManager } from '@/components/dashboard/MateriaisManager'

export default async function ClienteMateriaisPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clienteRow } = await supabase
    .from('clientes')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!clienteRow) redirect('/dashboard')

  const materiais = await getMateriaisCliente(clienteRow.id)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Materiais de marketing</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Materiais do seu e-commerce — visíveis apenas para os seus parceiros</p>
      </div>

      <MateriaisManager
        titulo="Seus materiais"
        subtitulo="Links de banners, imagens e criativos para os seus parceiros divulgarem"
        materiais={materiais}
        onCreate={criarMaterialCliente.bind(null, clienteRow.id)}
        onDelete={excluirMaterialCliente}
        emptyText="Nenhum material cadastrado ainda."
      />
    </div>
  )
}
