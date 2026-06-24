import { Link } from 'react-router-dom';
import '@/styles/legal.css';

export function TermsOfUsePage() {
  return (
    <div className="legal-page">
      <div className="legal-container">
        <Link to="/" className="legal-back-link">← Voltar ao início</Link>

        <h1>Termos de Uso</h1>
        <p className="legal-updated">Última atualização: 21 de junho de 2026</p>

        <h2>1. Uso da plataforma</h2>
        <p>
          O <strong>Se Liga no Açaí</strong> é uma plataforma digital para realização de pedidos
          online de açaí e produtos da loja. Ao acessar e utilizar este serviço, você declara ter
          lido e concordar com estes Termos de Uso. O uso da plataforma é permitido apenas para
          fins legais e pessoais.
        </p>

        <h2>2. Cadastro e login</h2>
        <p>
          Para realizar pedidos e acessar funcionalidades como programa de fidelidade e histórico
          de pedidos, é necessário criar uma conta. Você pode se cadastrar com e-mail e senha ou
          utilizar o login com Google.
        </p>
        <p>
          Você é responsável por manter a confidencialidade da sua senha e por todas as atividades
          realizadas com sua conta. Em caso de acesso não autorizado, notifique-nos imediatamente.
        </p>

        <h2>3. Responsabilidade pelas informações</h2>
        <p>
          Você se compromete a fornecer informações verdadeiras, precisas e atualizadas ao se
          cadastrar e ao realizar pedidos. Dados de entrega incorretos podem resultar em falha na
          entrega, sem possibilidade de reembolso após o despacho do pedido.
        </p>

        <h2>4. Pedidos, preços e disponibilidade</h2>
        <p>
          Os pedidos estão sujeitos à disponibilidade dos produtos no momento da compra. Nos
          reservamos o direito de recusar ou cancelar pedidos em caso de erro de preço, produto
          esgotado ou suspeita de uso indevido da plataforma.
        </p>
        <p>
          Os preços exibidos são em reais (R$) e podem ser alterados sem aviso prévio. O preço
          válido é sempre o exibido no momento da confirmação do pedido.
        </p>

        <h2>5. Formas de pagamento</h2>
        <p>Aceitamos as seguintes formas de pagamento:</p>
        <ul>
          <li><strong>PIX</strong> — pagamento instantâneo, gerado automaticamente no app.</li>
          <li><strong>Cartão na entrega</strong> — débito ou crédito, mediante disponibilidade do maquininho.</li>
          <li><strong>Dinheiro na entrega</strong> — informe no pedido se precisar de troco.</li>
        </ul>
        <p>
          Pedidos com pagamento via PIX expiram em 5 minutos. Após esse prazo, o pedido pode
          ser cancelado automaticamente.
        </p>

        <h2>6. Entrega e retirada na loja</h2>
        <p>
          As entregas são realizadas nos bairros atendidos pela loja, conforme exibido no app. O
          prazo de entrega é estimado e pode variar conforme volume de pedidos, distância e
          condições externas.
        </p>
        <p>
          Também é possível optar por retirada na loja. Nesse caso, o pedido ficará disponível
          para retirada após a confirmação de preparo.
        </p>

        <h2>7. Programa de fidelidade</h2>
        <p>
          O programa de fidelidade concede selos a cada compra acima do valor mínimo estabelecido.
          Ao completar o número de selos necessário, o cliente ganha um brinde que deve ser
          retirado presencialmente na loja.
        </p>
        <p>
          Os selos e brindes não têm valor monetário e não podem ser transferidos. A loja reserva
          o direito de alterar as regras do programa mediante aviso prévio na plataforma.
        </p>

        <h2>8. Promoções e cupons</h2>
        <p>
          Promoções e cupons de desconto são válidos apenas nas condições e período especificados.
          Não são cumulativos com outras ofertas, salvo indicação expressa. A loja pode encerrar ou
          alterar promoções a qualquer momento.
        </p>

        <h2>9. Cancelamentos</h2>
        <p>
          Pedidos podem ser cancelados sem custo até o início do preparo. Após o início do preparo,
          o cancelamento fica sujeito à análise da loja. Pedidos já despachados para entrega não
          podem ser cancelados.
        </p>
        <p>
          Para cancelar um pedido, entre em contato pelo WhatsApp disponível no app o mais rápido
          possível.
        </p>

        <h2>10. Limitações de responsabilidade</h2>
        <p>
          A plataforma é fornecida "no estado em que se encontra". Não nos responsabilizamos por:
        </p>
        <ul>
          <li>Interrupções temporárias do serviço por manutenção ou problemas técnicos.</li>
          <li>Atrasos na entrega causados por fatores externos (trânsito, clima, etc.).</li>
          <li>Divergências causadas por informações incorretas fornecidas pelo cliente.</li>
          <li>Danos indiretos decorrentes do uso ou da impossibilidade de uso da plataforma.</li>
        </ul>

        <h2>11. Propriedade intelectual</h2>
        <p>
          Todos os conteúdos da plataforma — incluindo textos, imagens, logotipos e design — são
          de propriedade do Se Liga no Açaí e protegidos por leis de propriedade intelectual. É
          proibida a reprodução sem autorização prévia.
        </p>

        <h2>12. Alterações dos termos</h2>
        <p>
          Podemos atualizar estes Termos de Uso a qualquer momento. Mudanças significativas serão
          comunicadas através do app. O uso continuado da plataforma após a publicação das
          alterações implica aceite das novas condições.
        </p>

        <h2>13. Lei aplicável e foro</h2>
        <p>
          Estes termos são regidos pela legislação brasileira, especialmente pelo Código de Defesa
          do Consumidor (Lei 8.078/90) e pela Lei Geral de Proteção de Dados (LGPD — Lei
          13.709/2018). Fica eleito o foro da comarca da loja para resolução de eventuais
          conflitos.
        </p>

        <h2>14. Contato</h2>
        <p>
          Para dúvidas, sugestões ou reclamações relacionadas a estes Termos de Uso:
        </p>
        <ul>
          <li><strong>Loja:</strong> Se Liga no Açaí</li>
          <li><strong>WhatsApp:</strong> disponível no app</li>
        </ul>

        <div className="legal-links-row">
          <Link to="/politica-de-privacidade">Política de Privacidade</Link>
          <Link to="/">← Voltar ao início</Link>
        </div>
      </div>
    </div>
  );
}
