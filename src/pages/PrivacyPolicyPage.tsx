import { Link } from 'react-router-dom';
import '@/styles/legal.css';

export function PrivacyPolicyPage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back-link">← Voltar ao início</Link>

        <h1>Política de Privacidade</h1>
        <p className="legal-updated">Última atualização: 21 de junho de 2026</p>

        <h2>1. Quem somos</h2>
        <p>
          O <strong>Se Liga no Açaí</strong> é uma plataforma online de pedidos de açaí que
          permite realizar compras, acompanhar pedidos, participar do programa de fidelidade e
          acessar promoções da loja. Ao utilizar nossos serviços, você concorda com esta Política de
          Privacidade.
        </p>

        <h2>2. Dados que coletamos</h2>
        <p>Para oferecer nossos serviços, coletamos os seguintes dados pessoais:</p>
        <ul>
          <li><strong>Nome completo</strong> — para identificar sua conta e personalizar o atendimento.</li>
          <li><strong>E-mail</strong> — para autenticação, notificações e comunicação.</li>
          <li><strong>Telefone (WhatsApp)</strong> — para confirmação de pedidos e suporte.</li>
          <li><strong>Endereço de entrega</strong> — bairro, rua, número e complemento informados por você.</li>
          <li><strong>Dados do pedido</strong> — itens, valores, datas e status dos pedidos.</li>
          <li><strong>Forma de pagamento</strong> — PIX, cartão na entrega ou dinheiro na entrega. Não armazenamos dados de cartão de crédito.</li>
          <li><strong>Foto de perfil</strong> — quando enviada voluntariamente pelo usuário.</li>
        </ul>

        <h2>3. Login com Google</h2>
        <p>
          Quando você opta por entrar com a conta Google, recebemos do Google as seguintes
          informações públicas do seu perfil: <strong>nome</strong>, <strong>e-mail</strong> e{' '}
          <strong>foto pública</strong>. Esses dados são usados exclusivamente para criar ou
          autenticar sua conta na plataforma. Não acessamos dados além do que é necessário para
          identificar você.
        </p>
        <p>
          O uso das informações recebidas via Google é regido também pela{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#d8b4fe' }}>
            Política de Privacidade do Google
          </a>
          .
        </p>

        <h2>4. Como usamos seus dados</h2>
        <p>Seus dados são utilizados para:</p>
        <ul>
          <li>Processar e confirmar seus pedidos.</li>
          <li>Calcular taxas de entrega e coordenar a entrega ao seu endereço.</li>
          <li>Gerenciar pagamentos e emitir confirmações.</li>
          <li>Operar o programa de fidelidade (acúmulo de selos e resgates de brindes).</li>
          <li>Enviar notificações sobre o status do seu pedido.</li>
          <li>Oferecer suporte e resolver dúvidas.</li>
          <li>Garantir a segurança e prevenir fraudes na plataforma.</li>
        </ul>

        <h2>5. Compartilhamento de dados</h2>
        <p>
          Não vendemos seus dados pessoais. Podemos compartilhá-los apenas com prestadores de
          serviços essenciais para o funcionamento da plataforma, como:
        </p>
        <ul>
          <li><strong>Provedores de autenticação</strong> — Google OAuth para login.</li>
          <li><strong>Serviços de hospedagem</strong> — para armazenamento seguro de dados.</li>
          <li><strong>Processamento de pagamentos</strong> — integração PIX e registro de pagamentos.</li>
          <li><strong>Comunicação</strong> — envio de mensagens via WhatsApp para atendimento.</li>
        </ul>
        <p>
          Todos os fornecedores são contratualmente obrigados a manter a confidencialidade e
          segurança dos seus dados.
        </p>

        <h2>6. Segurança dos dados</h2>
        <p>
          Adotamos medidas técnicas e organizacionais adequadas para proteger seus dados contra
          acesso não autorizado, perda, alteração ou divulgação indevida. Isso inclui controle de
          acesso, autenticação segura com tokens JWT e comunicação criptografada via HTTPS.
        </p>

        <h2>7. Retenção dos dados</h2>
        <p>
          Seus dados são mantidos enquanto sua conta estiver ativa ou enquanto for necessário para
          cumprir as finalidades descritas nesta política. Dados de pedidos podem ser retidos por
          prazo maior para fins fiscais e legais. Você pode solicitar a exclusão da sua conta a
          qualquer momento pelo canal de contato abaixo.
        </p>

        <h2>8. Seus direitos</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Acessar os dados pessoais que temos sobre você.</li>
          <li>Corrigir dados incompletos ou incorretos.</li>
          <li>Solicitar a exclusão dos seus dados (quando não houver obrigação legal de retenção).</li>
          <li>Revogar o consentimento para o uso dos seus dados a qualquer momento.</li>
          <li>Obter informações sobre com quem compartilhamos seus dados.</li>
        </ul>
        <p>
          Para exercer qualquer desses direitos, entre em contato conosco pelo canal disponível na
          seção "Contato".
        </p>

        <h2>9. Cookies e armazenamento local</h2>
        <p>
          Utilizamos armazenamento local (localStorage e sessionStorage) no seu navegador
          exclusivamente para manter sua sessão ativa e salvar preferências da plataforma, como
          localização de entrega. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
        </p>

        <h2>10. Alterações desta política</h2>
        <p>
          Podemos atualizar esta Política de Privacidade periodicamente. Quando houver mudanças
          relevantes, notificaremos você através do app. A data de última atualização estará sempre
          indicada no topo desta página.
        </p>

        <h2>11. Contato</h2>
        <p>
          Em caso de dúvidas, solicitações ou reclamações sobre o uso dos seus dados, entre em
          contato conosco:
        </p>
        <ul>
          <li><strong>Loja:</strong> Se Liga no Açaí</li>
          <li><strong>WhatsApp:</strong> disponível no app</li>
          <li><strong>E-mail:</strong> contato disponível no app</li>
        </ul>

        <div className="legal-links-row">
          <Link to="/termos-de-uso">Termos de Uso</Link>
          <Link to="/">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
