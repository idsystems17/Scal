'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function RedefinirSenhaPage() {
  return (
    <Suspense fallback={null}>
      <RedefinirSenhaConteudo />
    </Suspense>
  )
}

function RedefinirSenhaConteudo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pronto, setPronto] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const supabase = createClient()

    async function verificarSessao() {
      const code = searchParams.get('code')
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
          setPronto(true)
          setVerificando(false)
          return
        }
      }

      const { data } = await supabase.auth.getSession()
      if (data.session) {
        setPronto(true)
      }
      setVerificando(false)
    }

    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPronto(true)
        setVerificando(false)
      }
    })

    verificarSessao()

    return () => listener.subscription.unsubscribe()
  }, [searchParams])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')

    if (senha.length < 8) {
      setErro('A senha precisa ter no mínimo 8 caracteres.')
      return
    }

    setEnviando(true)
    const supabase = createClient()
    const { data, error } = await supabase.auth.updateUser({ password: senha })

    if (error || !data.user) {
      setErro(error?.message || 'Erro ao redefinir a senha.')
      setEnviando(false)
      return
    }

    const role = data.user.user_metadata?.role as string | undefined
    if (role === 'admin') router.push('/admin')
    else if (role === 'cliente') router.push('/dashboard')
    else if (role === 'parceiro') router.push('/minha-area')
    else router.push('/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#f4f7fc' }}>
      <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 400, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ background: '#0B081A', padding: '28px 40px 24px', textAlign: 'center' }}>
          <img src="/logo.png" alt="SCAL" style={{ width: 160, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
        </div>

        <div style={{ padding: '32px 40px 40px' }}>
          {verificando && (
            <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b' }}>Verificando link...</p>
          )}

          {!verificando && !pronto && (
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: '#0B081A', margin: '0 0 8px' }}>Link inválido ou expirado</h1>
              <p style={{ fontSize: 14, color: '#64748b', margin: '0 0 16px' }}>Solicite um novo link de redefinição.</p>
              <a href="/esqueci-senha" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>Esqueci minha senha</a>
            </div>
          )}

          {!verificando && pronto && (
            <>
              <div style={{ marginBottom: 24, textAlign: 'center' }}>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0B081A', margin: 0 }}>Defina sua nova senha</h1>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}>Nova senha</label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={senha}
                    onChange={e => setSenha(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #c0c5cc', borderRadius: 8, fontSize: 14, color: '#0B081A', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' }}
                  />
                </div>

                {erro && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#dc2626' }}>
                    {erro}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={enviando}
                  style={{ padding: '12px', background: enviando ? '#a5b4fc' : 'linear-gradient(135deg, #9B6AFF, #C2A4FF)', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: enviando ? 'not-allowed' : 'pointer', marginTop: 4 }}
                >
                  {enviando ? 'Salvando...' : 'Salvar nova senha'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
