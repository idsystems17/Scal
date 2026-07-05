import { NextRequest, NextResponse } from 'next/server'
import { FAQ_ADMIN, FAQ_CLIENTE, FAQ_PARCEIRO, faqParaContexto } from '@/lib/faq'

const MODELOS = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-flash-latest']

const FAQ_POR_ROLE = {
  admin: FAQ_ADMIN,
  cliente: FAQ_CLIENTE,
  parceiro: FAQ_PARCEIRO,
}

async function perguntarGemini(prompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY não configurada')

  let ultimoErro: unknown = null
  for (const modelo of MODELOS) {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelo}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
        }
      )
      if (!res.ok) {
        ultimoErro = new Error(`${modelo} retornou ${res.status}`)
        continue
      }
      const data = await res.json()
      const texto = data?.candidates?.[0]?.content?.parts?.[0]?.text
      if (typeof texto === 'string' && texto.trim()) return texto.trim()
      ultimoErro = new Error(`${modelo} retornou resposta vazia`)
    } catch (e) {
      ultimoErro = e
    }
  }
  throw ultimoErro ?? new Error('Nenhum modelo Gemini disponível')
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  const pergunta = typeof body?.pergunta === 'string' ? body.pergunta.trim() : ''
  const role = body?.role as keyof typeof FAQ_POR_ROLE | undefined

  if (!pergunta || !role || !FAQ_POR_ROLE[role]) {
    return NextResponse.json({ error: 'Requisição inválida' }, { status: 400 })
  }

  const contexto = faqParaContexto(FAQ_POR_ROLE[role])
  const prompt = `Você é o assistente de suporte do SCAL, uma plataforma de rastreamento de vendas por afiliados. Responda em português, de forma curta e direta, usando SOMENTE as informações do FAQ abaixo. Se a pergunta não tiver relação com o FAQ, diga educadamente que não tem essa informação e sugira contato com o suporte. Responda em texto simples, sem markdown (sem **, sem listas com * ou -, sem títulos).

FAQ:
${contexto}

Pergunta do usuário: ${pergunta}`

  try {
    const resposta = await perguntarGemini(prompt)
    return NextResponse.json({ resposta })
  } catch {
    return NextResponse.json(
      { error: 'Não consegui responder agora. Consulte o FAQ abaixo ou tente novamente em instantes.' },
      { status: 503 }
    )
  }
}
