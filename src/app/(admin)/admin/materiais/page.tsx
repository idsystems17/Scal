import { getMateriaisGlobais, criarMaterialGlobal, excluirMaterialGlobal } from '@/lib/actions/admin'
import { MateriaisManager } from '@/components/dashboard/MateriaisManager'

export default async function AdminMateriaisPage() {
  const materiais = await getMateriaisGlobais()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', margin: 0 }}>Materiais de marketing</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Materiais globais do SCAL — visíveis para todos os parceiros de todas as empresas</p>
      </div>

      <MateriaisManager
        titulo="Materiais globais"
        subtitulo="Links de banners, imagens e criativos disponíveis para qualquer parceiro"
        materiais={materiais}
        onCreate={criarMaterialGlobal}
        onDelete={excluirMaterialGlobal}
        emptyText="Nenhum material global cadastrado ainda."
      />
    </div>
  )
}
