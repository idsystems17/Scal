export interface FaqItem {
  pergunta: string
  resposta: string
}

export const FAQ_PARCEIRO: FaqItem[] = [
  {
    pergunta: 'Como funciona a atribuição de uma venda a mim?',
    resposta: 'Quando alguém clica no seu link, o SCAL grava um cookie de atribuição válido por 30 dias. Se a compra acontecer dentro desse prazo, a venda é atribuída a você automaticamente quando a empresa confirma o pagamento.',
  },
  {
    pergunta: 'Como gero um novo link de divulgação?',
    resposta: 'Na página "Meus links", clique em "Novo canal", escolha o canal (Instagram, WhatsApp, etc.) e informe a URL de destino. O SCAL gera um link único para você divulgar.',
  },
  {
    pergunta: 'Uma venda não apareceu no meu painel, por quê?',
    resposta: 'Isso pode acontecer se a compra ocorreu fora da janela de 30 dias do cookie, se a empresa ainda não confirmou o pagamento via webhook, ou se o cliente comprou sem passar pelo seu link.',
  },
  {
    pergunta: 'Como funciona minha comissão?',
    resposta: 'O SCAL rastreia o volume de vendas gerado pelos seus links, mas não calcula nem paga comissão. O percentual é combinado diretamente com a empresa.',
  },
  {
    pergunta: 'Fui bloqueado, o que aconteceu?',
    resposta: 'A empresa que você representa pode bloquear ou reativar parceiros a qualquer momento pelo painel dela. Fale diretamente com a empresa para entender o motivo.',
  },
]

export const FAQ_CLIENTE: FaqItem[] = [
  {
    pergunta: 'Como configuro o webhook para confirmar vendas?',
    resposta: 'Na página "Integrações" você encontra a URL do webhook e a chave secreta. Configure sua plataforma de vendas para enviar a confirmação de pedido para essa URL assinada com HMAC-SHA256.',
  },
  {
    pergunta: 'Como convido um novo parceiro?',
    resposta: 'No dashboard, clique em "Convidar parceiro", informe o e-mail (opcional) e envie o link de convite gerado. O parceiro cria a conta dele a partir desse link.',
  },
  {
    pergunta: 'O que acontece quando minha empresa atinge o limite de faturamento?',
    resposta: 'Ao ultrapassar R$ 50.000 em vendas confirmadas via SCAL, sua empresa passa a pagar uma taxa de 0,5% sobre o faturamento total gerado pela plataforma. Você recebe um alerta assim que isso acontece.',
  },
  {
    pergunta: 'Como bloqueio um parceiro?',
    resposta: 'Na tabela de parceiros do seu dashboard, clique em "Bloquear" ao lado do parceiro desejado. Ele deixa de gerar novos links, mas o histórico de vendas dele permanece registrado.',
  },
  {
    pergunta: 'Por que uma venda não foi atribuída a nenhum parceiro?',
    resposta: 'Vendas sem clique associado (compra direta, sem passar por um link de afiliado) são contabilizadas como "Direto" e não geram comissão para nenhum parceiro.',
  },
]

export const FAQ_ADMIN: FaqItem[] = [
  {
    pergunta: 'Como suspendo uma empresa?',
    resposta: 'Na página "Empresas ativas", clique em "Suspender" ao lado da empresa. Isso bloqueia o acesso dela sem apagar nenhum dado histórico.',
  },
  {
    pergunta: 'O que significa um alerta de limite excedido?',
    resposta: 'Alerta de faturamento significa que a empresa ultrapassou R$ 50.000 em vendas via SCAL e deve começar a pagar 0,5% sobre o total. Alerta de parceiros significa que ela excedeu o número de parceiros incluído no plano.',
  },
  {
    pergunta: 'Como aplico a taxa excedente de uma empresa?',
    resposta: 'No painel de alertas, clique em "Aplicar taxa 0,5%" no alerta correspondente. Isso marca o alerta como resolvido e registra a ação no log de auditoria.',
  },
  {
    pergunta: 'O que fazer se uma empresa tiver assinaturas de webhook inválidas?',
    resposta: 'Consulte a página "Segurança" — ela lista tentativas de webhook com assinatura HMAC inválida. Normalmente indica configuração incorreta da chave secreta do lado da plataforma de vendas do cliente.',
  },
]

export function faqParaContexto(faq: FaqItem[]): string {
  return faq.map((f, i) => `${i + 1}. Pergunta: ${f.pergunta}\nResposta: ${f.resposta}`).join('\n\n')
}
