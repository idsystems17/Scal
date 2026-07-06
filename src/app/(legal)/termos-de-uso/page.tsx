const ATUALIZADO_EM = '2026-07-05'

const secaoStyle: React.CSSProperties = { marginTop: 32 }
const h2Style: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: '#0B081A', marginBottom: 10 }
const pStyle: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.7, color: '#334155', margin: '0 0 12px' }
const liStyle: React.CSSProperties = { fontSize: 14.5, lineHeight: 1.7, color: '#334155', marginBottom: 6 }

export default function TermosDeUsoPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#f4f7fc' }}>
      <div style={{ background: '#0B081A', padding: '28px 24px', textAlign: 'center' }}>
        <img src="/logo.png" alt="SCAL" style={{ width: 140, objectFit: 'contain', display: 'block', margin: '0 auto' }} />
      </div>

      <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px 80px' }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: '#0B081A', marginBottom: 6 }}>Termos de Uso</h1>
        <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 30 }}>Última atualização: {ATUALIZADO_EM}</p>

        <p style={pStyle}>
          Estes Termos de Uso regulam o acesso e a utilização da plataforma SCAL. Ao criar uma conta ou usar o
          sistema, a empresa contratante e seus parceiros/afiliados concordam com as condições descritas abaixo.
        </p>

        <section style={secaoStyle}>
          <h2 style={h2Style}>1. Quem oferece o serviço</h2>
          <p style={pStyle}>
            O SCAL é operado sob a marca <strong>ADMW</strong>, por <strong>[NOME COMPLETO DO RESPONSÁVEL]</strong>, inscrito(a) no
            CPF/CNPJ <strong>[CPF OU CNPJ]</strong>, com sede em <strong>[CIDADE/UF]</strong>, doravante
            &quot;SCAL&quot; ou &quot;plataforma&quot;.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>2. O que o SCAL é (e o que não é)</h2>
          <p style={pStyle}>
            O SCAL é uma ferramenta de rastreamento de atribuição de vendas: ela identifica, por meio de links
            únicos e cookies, qual parceiro/afiliado originou uma venda, e apresenta relatórios de volume de
            vendas para a empresa contratante.
          </p>
          <p style={pStyle}>
            <strong>O SCAL não processa pagamentos, não emite cobranças aos clientes finais e não calcula nem
            realiza o pagamento de comissões</strong> aos parceiros. O pagamento de comissões, quando existir, é
            de responsabilidade exclusiva da empresa contratante, fora da plataforma SCAL.
          </p>
          <p style={pStyle}>
            O rastreamento depende de tecnologias como cookies e parâmetros de URL. O SCAL não garante 100% de
            precisão na atribuição em casos de bloqueadores de cookies, navegação anônima ou configurações do
            navegador do visitante final que impeçam esse rastreamento.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>3. Cadastro e responsabilidade pela conta</h2>
          <ul style={{ paddingLeft: 20, margin: '0 0 12px' }}>
            <li style={liStyle}>O cadastro deve conter informações verdadeiras sobre a empresa e seus responsáveis</li>
            <li style={liStyle}>A empresa contratante é responsável por conceder e revogar acessos de seus parceiros dentro da plataforma</li>
            <li style={liStyle}>Cada usuário é responsável por manter sua senha em sigilo e por toda atividade realizada com suas credenciais</li>
            <li style={liStyle}>O SCAL pode suspender contas com indícios de uso indevido, fraude ou violação destes Termos</li>
          </ul>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>4. Planos, cobrança e taxa de uso</h2>
          <p style={pStyle}>
            O acesso ao SCAL é cobrado por assinatura anual, no valor vigente informado no momento da contratação,
            processada e parcelada diretamente pela plataforma de pagamento utilizada (atualmente Kiwify).
          </p>
          <p style={pStyle}>
            Além da assinatura, incide uma taxa de uso de <strong>0,5% sobre o faturamento total processado
            através da plataforma</strong>, aplicável a partir do momento em que o faturamento acumulado da
            empresa contratante ultrapassar <strong>R$ 50.000,00</strong>. Essa taxa é calculada automaticamente
            pelo sistema e informada no painel da empresa.
          </p>
          <p style={pStyle}>
            O não pagamento da assinatura ou da taxa de uso pode resultar em suspensão do acesso à plataforma.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>5. Obrigações dos parceiros/afiliados</h2>
          <p style={pStyle}>
            Parceiros devem divulgar seus links de forma lícita, sem uso de spam, informações enganosas ou
            práticas que violem a lei ou os termos da plataforma de pagamento utilizada pela empresa contratante.
            A empresa contratante é responsável por fiscalizar a conduta de seus parceiros.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>6. Propriedade intelectual</h2>
          <p style={pStyle}>
            O software, a marca e o layout do SCAL pertencem ao seu responsável e não podem ser copiados,
            reproduzidos ou utilizados fora do contexto autorizado sem permissão expressa.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>7. Limitação de responsabilidade</h2>
          <p style={pStyle}>
            O SCAL é fornecido &quot;como está&quot;. Não nos responsabilizamos por: (a) decisões comerciais tomadas
            com base nos relatórios da plataforma; (b) indisponibilidades causadas por terceiros (provedores de
            hospedagem, banco de dados ou plataforma de pagamento); (c) imprecisões de atribuição decorrentes de
            bloqueio de cookies pelo navegador do visitante final; (d) uso indevido das credenciais de acesso por
            terceiros não autorizados.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>8. Cancelamento</h2>
          <p style={pStyle}>
            A empresa contratante pode solicitar o cancelamento da assinatura a qualquer momento, pelo canal de
            contato informado na seção 10. O cancelamento não gera reembolso automático de valores já pagos,
            salvo previsão em contrário na plataforma de pagamento utilizada.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>9. Alterações nestes Termos</h2>
          <p style={pStyle}>
            Estes Termos podem ser atualizados periodicamente. A data no topo desta página indica a versão
            vigente. O uso continuado da plataforma após uma atualização implica concordância com os novos termos.
          </p>
        </section>

        <section style={secaoStyle}>
          <h2 style={h2Style}>10. Foro e contato</h2>
          <p style={pStyle}>
            Fica eleito o foro da comarca de <strong>[CIDADE/UF]</strong> para dirimir eventuais controvérsias
            decorrentes destes Termos, com renúncia a qualquer outro, por mais privilegiado que seja. Dúvidas
            podem ser enviadas para <strong>[EMAIL DE CONTATO]</strong>.
          </p>
        </section>

        <p style={{ ...pStyle, marginTop: 30 }}>
          Para saber como tratamos seus dados pessoais, consulte também a nossa{' '}
          <a href="/politica-privacidade" style={{ color: '#9B6AFF', fontWeight: 600, textDecoration: 'none' }}>
            Política de Privacidade
          </a>.
        </p>
      </div>
    </div>
  )
}
