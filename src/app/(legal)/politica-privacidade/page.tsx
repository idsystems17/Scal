const ATUALIZADO_EM = '2026-07-05'

const secaoStyle: React.CSSProperties = { marginTop: 32 }
const h2Style: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: '#0B081A', marginBottom: 10 }
const h3Style: React.CSSProperties = { fontSize: 15, fontWeight: 700, color: '#1e293b', margin: '18px 0 8px' }
const pStyle: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px' }
const liStyle: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.7, color: '#334155', marginBottom: 6 }

export default function PoliticaPrivacidadePage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fc' }}>
      <div style={{ background: '#0B081A', padding: '28px 24px', textAlign: 'center' }}>
        <img src="/logo.png" alt="SCAL" style={{ width: 140, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B081A', marginBottom: 6 }}>Política de Privacidade</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 30 }}>Última atualização: {ATUALIZADO_EM}</p>

        <p style={pStyle}>
          Esta Política de Privacidade descreve como o SCAL (&quot;nós&quot;, &quot;plataforma&quot; ou &quot;sistema&quot;)
          coleta, usa, armazena e protege dados pessoais de empresas contratantes, parceiros/afiliados e visitantes,
          em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
        </p>

        <section style={secaoStyle}>
          <h2 style={h2Style}>1. Quem é o responsável pelos seus dados</h2>
          <p style={pStyle}>
            O SCAL é operado sob a marca <strong>ADMW</strong>, por <strong>[NOME COMPLETO DO RESPONSÁVEL]</strong>, inscrito(a) no
            CPF/CNPJ <strong>[CPF OU CNPJ]</strong>, com sede em <strong>[CIDADE/UF]</strong>, doravante &quot;Controlador&quot;.
          </p>
          <p style={pStyle}>
            Para qualquer dúvida ou solicitação relacionada aos seus dados pessoais, entre em contato pelo
            e-mail <strong>[EMAIL DE CONTATO]</strong>.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>2. O que o SCAL faz (e o que não faz)</h2>
          <p style={pStyle}>
            O SCAL é uma plataforma de rastreamento de vendas por link de afiliado/parceiro. Ele identifica qual
            parceiro originou uma venda (via cookie e/ou parâmetro de URL) e exibe relatórios de volume de vendas
            para a empresa contratante. <strong>O SCAL não processa pagamentos e não calcula ou realiza o pagamento
            de comissões</strong> — esses fluxos são de responsabilidade da própria empresa contratante e/ou da
            plataforma de pagamento que ela utiliza.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>3. Quais dados coletamos</h2>

          <h3 style={h3Style}>3.1 Empresas contratantes (&quot;clientes&quot;)</h3>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>Nome da empresa e URL do site/loja</li>
            <li style={liStyle}>E-mail e senha de acesso (a senha é armazenada de forma criptografada, nunca em texto puro)</li>
            <li style={liStyle}>Dados de faturamento processado pela plataforma (valores de venda, para fins de cobrança da taxa de uso)</li>
          </ul>

          <h3 style={h3Style}>3.2 Parceiros/afiliados</h3>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>Nome e e-mail</li>
            <li style={liStyle}>Canais de divulgação e links gerados</li>
            <li style={liStyle}>Histórico de cliques e vendas atribuídas a ele</li>
          </ul>

          <h3 style={h3Style}>3.3 Visitantes que clicam em um link de afiliado</h3>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>Endereço IP — armazenado apenas na forma de hash (não reversível), nunca em texto puro</li>
            <li style={liStyle}>User-agent do navegador e página de origem (referrer)</li>
            <li style={liStyle}>Um cookie de atribuição, válido por 30 dias, usado exclusivamente para identificar qual parceiro originou uma eventual compra</li>
          </ul>

          <h3 style={h3Style}>3.4 Dados recebidos de plataformas de pagamento</h3>
          <p style={pStyle}>
            Quando uma venda é confirmada na plataforma de pagamento usada pela empresa contratante (ex: Kiwify),
            o SCAL recebe automaticamente os dados da venda necessários para o rastreamento (identificador do
            pedido, valor e status). Dados adicionais eventualmente enviados nesse processo (como nome ou e-mail
            do comprador final) são usados apenas para o registro da venda e não são utilizados para nenhuma outra
            finalidade.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>4. Para que usamos esses dados</h2>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>Autenticar o acesso à plataforma e manter a sessão de cada usuário</li>
            <li style={liStyle}>Atribuir vendas ao parceiro correto e gerar relatórios para a empresa contratante</li>
            <li style={liStyle}>Calcular a taxa de uso da plataforma (0,5% sobre o faturamento processado acima do limite do plano)</li>
            <li style={liStyle}>Enviar notificações operacionais (ex: confirmação de webhook, alertas de plano)</li>
            <li style={liStyle}>Cumprir obrigações legais e fiscais</li>
            <li style={liStyle}>Investigar problemas de segurança e uso indevido da plataforma</li>
          </ul>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>5. Com quem compartilhamos dados</h2>
          <p style={pStyle}>Não vendemos dados pessoais. Compartilhamos dados apenas com prestadores que operam a infraestrutura do SCAL, sempre na medida necessária para o funcionamento do serviço:</p>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}><strong>Supabase</strong> — banco de dados e autenticação</li>
            <li style={liStyle}><strong>Vercel</strong> — hospedagem da aplicação</li>
            <li style={liStyle}><strong>Kiwify</strong> (ou outra plataforma de pagamento usada pela empresa contratante) — origem dos dados de venda recebidos via webhook</li>
            <li style={liStyle}><strong>Google Gemini</strong> — usado exclusivamente na Central de Ajuda (chat com IA); processa apenas o texto da pergunta digitada pelo usuário no momento do atendimento, não recebe nome, e-mail ou outros dados de cadastro</li>
          </ul>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>6. Por quanto tempo guardamos seus dados</h2>
          <p style={pStyle}>
            Mantemos os dados pelo tempo necessário para cumprir as finalidades descritas nesta política e as
            obrigações legais aplicáveis (incluindo o prazo fiscal de guarda de registros de venda). Dados de
            navegação/cliques sem venda associada são removidos após um período limitado. Você pode solicitar
            a exclusão dos seus dados a qualquer momento, conforme a seção 8 abaixo, ressalvadas as hipóteses em
            que a lei exige a manutenção do registro.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>7. Segurança</h2>
          <p style={pStyle}>
            Usamos controles técnicos para proteger seus dados, incluindo: conexão criptografada (HTTPS) em toda
            a plataforma, isolamento de dados por empresa contratante (Row Level Security no banco de dados),
            senhas armazenadas de forma criptografada, validação de assinatura em webhooks recebidos e hash
            (não reversível) de endereços IP. Nenhum sistema é 100% imune a falhas, mas trabalhamos continuamente
            para reduzir os riscos.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>8. Seus direitos</h2>
          <p style={pStyle}>Nos termos da LGPD, você pode solicitar, a qualquer momento e mediante confirmação de identidade:</p>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>Confirmação de que tratamos seus dados e acesso a eles</li>
            <li style={liStyle}>Correção de dados incompletos, inexatos ou desatualizados</li>
            <li style={liStyle}>Exclusão dos dados tratados com base no seu consentimento</li>
            <li style={liStyle}>Portabilidade dos dados a outro fornecedor de serviço</li>
            <li style={liStyle}>Informação sobre com quem seus dados foram compartilhados</li>
            <li style={liStyle}>Revogação do consentimento, quando aplicável</li>
          </ul>
          <p style={pStyle}>
            Para exercer qualquer um desses direitos, envie um e-mail para <strong>[EMAIL DE CONTATO]</strong>.
            Responderemos em prazo razoável, conforme previsto na LGPD.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>9. Alterações nesta política</h2>
          <p style={pStyle}>
            Podemos atualizar esta Política de Privacidade periodicamente. A data no topo desta página indica a
            versão vigente. Alterações relevantes serão comunicadas aos usuários cadastrados.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>10. Contato</h2>
          <p style={pStyle}>
            Dúvidas sobre esta política ou sobre o tratamento dos seus dados podem ser enviadas para{' '}
            <strong>[EMAIL DE CONTATO]</strong>.
          </p>
        </section>
      </div>
    </div>
  )
}
