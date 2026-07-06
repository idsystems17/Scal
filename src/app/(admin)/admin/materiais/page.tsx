import { getMateriaisGlobais, criarMaterialGlobal, excluirMaterialGlobal, getConfigPlataforma, atualizarLogoPlataforma } from '@/lib/actions/admin'
import { MateriaisManager } from '@/components/dashboard/MateriaisManager'
import { LogoConfigForm } from '@/components/dashboard/LogoConfigForm'

export const dynamic = 'force-dynamic'

export default async function AdminMateriaisPage() {
  const [materiais, { logoUrl }] = await Promise.all([
    getMateriaisGlobais(),
    getConfigPlataforma(),
  ])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Materiais de marketing</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Materiais globais do SCAL — visíveis para todos os parceiros de todos os e-commerces</p>
      </div>

      <LogoConfigForm logoAtual={logoUrl} onSalvar={atualizarLogoPlataforma} />

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
