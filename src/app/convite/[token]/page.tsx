'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function gerarCodigoUnico(nome: string): string {
  return nome.split(' ')[0].toUpperCase().slice(0, 6) + Math.random().toString(36).slice(2, 5).toUpperCase()
}

interface Convite {
  id: string
  cliente_id: string
  token: string
  usado: boolean
  expires_at: string
}

export default function ConvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [convite, setConvite] = useState<Convite | null>(null)
  const [status, setStatus] = useState<'carregando' | 'valido' | 'invalido'>('carregando')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function verificarConvite() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('convites')
        .select('id, cliente_id, token, usado, expires_at')
        .eq('token', token)
        .single()

      if (error || !data) {
        setStatus('invalido')
        return
      }

      const expirado = new Date(data.expires_at) < new Date()
      if (data.usado || expirado) {
        setStatus('invalido')
        return
      }

      setConvite(data)
      setStatus('valido')
    }

    verificarConvite()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!convite) return
    setEnviando(true)
    setErro('')

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password: senha,
      options: {
        data: {
          role: 'parceiro',
          cliente_id: convite.cliente_id,
          nome,
        },
      },
    })

    if (authError || !authData.user) {
      setErro(authError?.message || 'Erro ao criar conta.')
      setEnviando(false)
      return
    }

    const codigoUnico = gerarCodigoUnico(nome)

    const { error: parceiroError } = await supabase.from('parceiros').insert({
      user_id: authData.user.id,
      cliente_id: convite.cliente_id,
      nome,
      email,
      codigo_unico: codigoUnico,
    })

    if (parceiroError) {
      setErro('Erro ao cadastrar parceiro. Tente novamente.')
      setEnviando(false)
      return
    }

    await supabase.from('convites').update({ usado: true }).eq('id', convite.id)

    await supabase.rpc('atualizar_contagem_parceiros', { p_cliente_id: convite.cliente_id })

    router.push('/minha-area')
  }

  if (status === 'carregando') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Verificando convite...</p>
      </div>
    )
  }

  if (status === 'invalido') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Convite inválido ou expirado</h1>
          <p className="text-gray-600 mb-4">Este link de convite não é mais válido.</p>
          <a href="/" className="text-blue-600 underline">Voltar ao início</a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Criar sua conta de parceiro</h1>

        {erro && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {erro}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="seu@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </div>

          <button
            type="submit"
            disabled={enviando}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {enviando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>
      </div>
    </div>
  )
}
