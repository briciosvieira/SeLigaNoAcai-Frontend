import type { Order } from '@/types/order.types';
import { formatBRL } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import {
  getOrderTotal,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/utils/order.util';
import { X } from 'lucide-react';
import './CustomerOrderDetailsModal.css';

interface Props {
  order: Order;
  onClose: () => void;
}

export function CustomerOrderDetailsModal({ order, onClose }: Props) {
  const total = getOrderTotal(order);
  const subtotal = order.subtotal ?? items.reduce((acc, item) => acc + Number(item.totalAmount ?? 0), 0);
  const deliveryFee = order.deliveryFee ?? 0;
  const discount = 0; // Campo de desconto não disponível na API de cliente

  const items = order.items ?? [];

  const deliveryInfo = order.deliveryZoneName
    ? `Entrega em: ${order.deliveryZoneName}`
    : 'Retirada na loja';

  return (
    <div className="customer-order-details-modal-overlay" onClick={onClose}>
      <div className="customer-order-details-modal-content" onClick={(e) => e.stopPropagation()}>
        <header className="codm-header">
          <div>
            <span className="codm-header-label">Detalhes do Pedido</span>
            <h2 className="codm-header-title">#{order.orderNumber}</h2>
          </div>
          <button className="codm-close-button" onClick={onClose} title="Fechar">
            <X size={20} />
          </button>
        </header>

        <main className="codm-main">
          <section className="codm-grid">
            <div className="codm-grid-item">
              <span>Status do Pedido</span>
              <strong>{getOrderStatusLabel(order.orderStatus ?? order.status)}</strong>
            </div>
            <div className="codm-grid-item">
              <span>Data</span>
              <strong>{formatDateTime(order.createdAt)}</strong>
            </div>
            <div className="codm-grid-item">
              <span>Pagamento</span>
              <strong>{getPaymentMethodLabel(order.paymentMethod)}</strong>
            </div>
            <div className="codm-grid-item">
              <span>Status Pagamento</span>
              <strong>{getPaymentStatusLabel(order.paymentStatus)}</strong>
            </div>
          </section>

          <section>
            <h3 className="codm-section-title">Itens do Pedido</h3>
            <div className="codm-items-list">
              {items.map((item) => (
                <div key={item.id} className="codm-item">
                  <div className="codm-item-header">
                    <span className="codm-item-quantity">{item.quantity}x</span>
                    <span className="codm-item-name">
                      {Number(item.totalAmount ?? 0) === 0 && item.itemDescription
                        ? item.itemDescription
                        : item.productName}
                    </span>
                    <strong className="codm-item-price">{formatBRL(Number(item.totalAmount ?? 0))}</strong>
                  </div>
                  {item.variantName && (
                    <p className="codm-item-variant">Tamanho: {item.variantName}</p>
                  )}
                  {item.options && item.options.length > 0 && (
                    <div className="codm-item-options">
                      <strong>Adicionais:</strong>
                      <ul>
                        {item.options.map(opt => (
                          <li key={opt.optionId}>{opt.optionName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section className="codm-totals">
            <h3 className="codm-section-title">Resumo Financeiro</h3>
            <div className="codm-totals-grid">
              <span>Subtotal</span>
              <span>{formatBRL(subtotal)}</span>

              <span>Taxa de Entrega</span>
              <span>{deliveryFee > 0 ? formatBRL(deliveryFee) : 'Grátis'}</span>

              <span>Desconto</span>
              <span className="codm-discount">{formatBRL(discount)}</span>

              <strong className="codm-total-label">Total</strong>
              <strong className="codm-total-value">{formatBRL(total)}</strong>
            </div>
          </section>

          <section>
            <h3 className="codm-section-title">Entrega</h3>
            <p className="codm-delivery-info">{deliveryInfo}</p>
            {order.notes && (
              <>
                <h3 className="codm-section-title" style={{ marginTop: 16 }}>Observações</h3>
                <p className="codm-delivery-info">{order.notes}</p>
              </>
            )}
          </section>

        </main>

        <footer className="codm-footer">
          <button className="codm-footer-close-button" onClick={onClose}>
            Fechar
          </button>
        </footer>
      </div>
    </div>
  );
}

```