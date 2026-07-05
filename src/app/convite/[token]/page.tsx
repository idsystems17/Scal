'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function ConvitePage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string

  const [status, setStatus] = useState<'carregando' | 'valido' | 'invalido'>('carregando')
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    async function verificarConvite() {
      const res = await fetch(`/api/convite/${token}`)
      const json = await res.json()
      setStatus(json.valido ? 'valido' : 'invalido')
    }

    verificarConvite()
  }, [token])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setErro('')

    const res = await fetch('/api/aceitar-convite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, nome, email, senha }),
    })
    const json = await res.json()

    if (!res.ok) {
      setErro(json.error || 'Erro ao criar conta.')
      setEnviando(false)
      return
    }

    router.push(json.autoLoginFalhou ? '/login?cadastro=ok' : '/minha-area')
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
              minLength={8}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mínimo 8 caracteres"
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
