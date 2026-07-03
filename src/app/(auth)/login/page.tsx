import { redirect } from 'next/navigation'

// Por enquanto redireciona para minha-area (parceiro)
// A autenticação real será implementada posteriormente
export default function LoginPage() {
  redirect('/minha-area')
}
