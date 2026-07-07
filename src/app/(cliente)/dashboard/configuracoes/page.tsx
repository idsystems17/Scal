import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function ConfiguracoesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const saved = sp.saved === '1'
  const tipoSalvo = sp.tipo ?? 'dados'
  const erro = sp.erro

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: cliente } = await supabase
    .from('clientes')
    .select('id, nome_loja, url_loja')
    .eq('user_id', user.id)
    .single()

  if (!cliente) redirect('/dashboard')

  async function salvarDados(formData: FormData) {
    'use server'
    const s = await createClient()
    const { data: { user: u } } = await s.auth.getUser()
    if (!u) return
    const { data: row } = await s.from('clientes').select('id').eq('user_id', u.id).single()
    if (!row) return
    const nome = String(formData.get('nome_loja') ?? '').trim()
    const url = String(formData.get('url_loja') ?? '').trim()
    await s.from('clientes').update({
      ...(nome ? { nome_loja: nome } : {}),
      ...(url ? { url_loja: url } : {}),
    }).eq('id', row.id)
    redirect('/dashboard/configuracoes?saved=1&tipo=dados')
  }

  async function alterarSenha(formData: FormData) {
    'use server'
    const nova = String(formData.get('senha_nova') ?? '').trim()
    const confirma = String(formData.get('confirma_senha') ?? '').trim()
    if (nova.length < 8 || nova !== confirma) {
      redirect('/dashboard/configuracoes?erro=senha')
    }
    const s = await createClient()
    await s.auth.updateUser({ password: nova })
    redirect('/dashboard/configuracoes?saved=1&tipo=senha')
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #c0c5cc',
    fontSize: 14, color: '#0B081A', background: 'white', boxSizing: 'border-box',
    outline: 'none',
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6, display: 'block',
  }

  const btnPrimary: React.CSSProperties = {
    padding: '10px 24px', background: '#2563eb', color: 'white', border: 'none',
    borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 640 }}>
      <div>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Configurações</h2>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>Dados do e-commerce e segurança da conta</p>
      </div>

      {saved && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: '#ecfdf3', border: '1px solid #bbf7d0', color: '#16a34a', fontSize: 13, fontWeight: 600 }}>
          {tipoSalvo === 'senha' ? 'Senha alterada com sucesso!' : 'Dados salvos com sucesso!'}
        </div>
      )}

      {erro === 'senha' && (
        <div style={{ padding: '14px 18px', borderRadius: 12, background: '#fff1f3', border: '1px solid #fecdd3', color: '#e11d48', fontSize: 13, fontWeight: 600 }}>
          Senhas não conferem ou muito curta (mínimo 8 caracteres).
        </div>
      )}

      {/* Dados do e-commerce */}
      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 20px' }}>Dados do e-commerce</h3>
        <form action={salvarDados} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="nome_loja">Nome do e-commerce</label>
            <input
              id="nome_loja"
              name="nome_loja"
              type="text"
              defaultValue={cliente.nome_loja}
              placeholder="Ex: Minha Loja"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="url_loja">URL da loja</label>
            <input
              id="url_loja"
              name="url_loja"
              type="url"
              defaultValue={cliente.url_loja}
              placeholder="https://minhaloja.com.br"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={btnPrimary}>Salvar dados</button>
          </div>
        </form>
      </div>

      {/* Alterar senha */}
      <div style={{ background: 'white', border: '1px solid #c4c9d0', borderRadius: 16, padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#0B081A', margin: '0 0 8px' }}>Segurança da conta</h3>
        <p style={{ fontSize: 12, color: '#94a3b8', margin: '0 0 20px' }}>E-mail: <strong style={{ color: '#475569' }}>{user.email}</strong></p>
        <form action={alterarSenha} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelStyle} htmlFor="senha_nova">Nova senha</label>
            <input
              id="senha_nova"
              name="senha_nova"
              type="password"
              placeholder="Mínimo 8 caracteres"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle} htmlFor="confirma_senha">Confirmar nova senha</label>
            <input
              id="confirma_senha"
              name="confirma_senha"
              type="password"
              placeholder="Repita a nova senha"
              style={inputStyle}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" style={{ ...btnPrimary, background: '#475569' }}>Alterar senha</button>
          </div>
        </form>
      </div>
    </div>
  )
}
