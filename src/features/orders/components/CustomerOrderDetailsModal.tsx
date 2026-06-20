import { useEffect, useState } from 'react';
import { X, MessageCircle } from 'lucide-react';
import { getMyOrderByIdRequest } from '@/services/orders.service';
import { formatBRL } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import {
  getOrderTotal,
  getOrderStatusLabel,
  getOrderStatusClass,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
} from '@/utils/order.util';
import { useCurrentStore } from '@/hooks/useCurrentStore';
import { buildWhatsAppUrl } from '@/utils/whatsapp';
import type { Order } from '@/types/order.types';

interface Props {
  order: Order;
  onClose: () => void;
  onDetailLoaded?: (order: Order) => void;
}

function safeNum(val: unknown): number {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
}

export function CustomerOrderDetailsModal({ order, onClose, onDetailLoaded }: Props) {
  const [detail, setDetail] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const store = useCurrentStore();
  const whatsappUrl = buildWhatsAppUrl(store?.whatsappNumber, 'Olá! Tenho uma dúvida sobre meu pedido.');

  useEffect(() => {
    setIsLoading(true);
    getMyOrderByIdRequest(order.id)
      .then((d) => {
        setDetail(d);
        if (d) onDetailLoaded?.(d);
      })
      .catch(() => setDetail(null))
      .finally(() => setIsLoading(false));
  }, [order.id]);

  const o = detail ?? order;

  const total = getOrderTotal(o);
  const subtotal = safeNum(o.subtotalAmount ?? o.subtotal);
  const deliveryFee = safeNum(o.deliveryFee);
  const discount = safeNum(o.discountAmount);
  const statusLabel = getOrderStatusLabel(o.orderStatus ?? o.status);
  const statusClass = getOrderStatusClass(o.orderStatus ?? o.status);
  const paymentMethodLabel = getPaymentMethodLabel(
    typeof o.paymentMethod === 'string' ? o.paymentMethod : undefined,
  );
  const paymentStatusLabel = getPaymentStatusLabel(
    typeof o.paymentStatus === 'string' ? o.paymentStatus : undefined,
  );
  const formattedDate = o.createdAt ? formatDateTime(o.createdAt) : '–';
  const items = o.items ?? [];

  function handleOverlayClick(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose();
  }

  return (
    <div className="order-details-overlay" onClick={handleOverlayClick}>
      <div className="order-details-modal">
        {/* Header */}
        <div className="order-details-header">
          <div>
            <h2 className="order-details-title">#{o.orderNumber}</h2>
            <p className="order-details-date">{formattedDate}</p>
          </div>
          <button type="button" className="order-details-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="order-details-body">
          {/* Status row */}
          <div>
            <p className="order-details-section-title">Status</p>
            <div className="order-details-status-row">
              <span className={`customer-order-status ${statusClass}`}>{statusLabel}</span>
              <span className="customer-order-status awaiting-payment" style={{ fontSize: 12 }}>
                {paymentStatusLabel}
              </span>
            </div>
          </div>

          {/* Payment + Delivery info */}
          <div>
            <p className="order-details-section-title">Informações</p>
            <div className="order-details-info-grid">
              <div className="order-details-info-item">
                <span className="order-details-info-label">Forma de pagamento</span>
                <strong className="order-details-info-value">{paymentMethodLabel}</strong>
              </div>
              {(o.neighborhood || o.deliveryZoneName) && (
                <div className="order-details-info-item">
                  <span className="order-details-info-label">Bairro de entrega</span>
                  <strong className="order-details-info-value">
                    {o.neighborhood ?? o.deliveryZoneName}
                  </strong>
                </div>
              )}
            </div>
          </div>

          {/* Items */}
          <div>
            <p className="order-details-section-title">Itens do pedido</p>
            {isLoading ? (
              <p className="order-details-loading">Carregando itens…</p>
            ) : items.length === 0 ? (
              <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14 }}>
                Itens não disponíveis.
              </p>
            ) : (
              <div className="order-details-items">
                {items.map((item, idx) => {
                  const itemTotal = safeNum(item.totalAmount);
                  const isFree = itemTotal === 0;
                  return (
                    <div key={item.id ?? idx} className="order-details-item">
                      <div className="order-details-item-header">
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p className="order-details-item-name">
                            {item.quantity}× {item.productName ?? 'Produto'}
                          </p>
                          {item.variantName && (
                            <p className="order-details-item-variant">{item.variantName}</p>
                          )}
                        </div>
                        <span
                          className="order-details-item-price"
                          style={isFree ? { color: '#4ade80' } : undefined}
                        >
                          {isFree ? 'Grátis' : formatBRL(itemTotal)}
                        </span>
                      </div>

                      {item.selectedOptions && item.selectedOptions.length > 0 && (
                        <div className="order-details-item-options">
                          {item.selectedOptions.map((opt, oi) => (
                            <span key={oi} className="order-details-item-option-tag">
                              {opt.optionName}
                            </span>
                          ))}
                        </div>
                      )}

                      {item.notes && (
                        <p
                          style={{
                            margin: '8px 0 0',
                            fontSize: 12,
                            color: 'rgba(255,255,255,0.5)',
                            fontStyle: 'italic',
                          }}
                        >
                          {item.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Totals */}
          <div className="order-details-totals">
            {subtotal > 0 && (
              <div className="order-details-total-row">
                <span className="order-details-total-label">Subtotal</span>
                <span className="order-details-total-value">{formatBRL(subtotal)}</span>
              </div>
            )}
            {deliveryFee > 0 && (
              <div className="order-details-total-row">
                <span className="order-details-total-label">Taxa de entrega</span>
                <span className="order-details-total-value">{formatBRL(deliveryFee)}</span>
              </div>
            )}
            {deliveryFee === 0 && (
              <div className="order-details-total-row">
                <span className="order-details-total-label">Taxa de entrega</span>
                <span style={{ fontWeight: 800, color: '#4ade80', fontSize: 14 }}>Grátis</span>
              </div>
            )}
            {discount > 0 && (
              <div className="order-details-total-row">
                <span className="order-details-total-label">Desconto</span>
                <span style={{ fontWeight: 800, color: '#4ade80', fontSize: 14 }}>
                  − {formatBRL(discount)}
                </span>
              </div>
            )}
            <div className="order-details-total-row final">
              <span>Total</span>
              <span>{formatBRL(total)}</span>
            </div>
          </div>

          {o.notes && (
            <div>
              <p className="order-details-section-title">Observações</p>
              <p style={{ color: 'rgba(255,255,255,0.72)', fontSize: 14, margin: 0 }}>
                {o.notes}
              </p>
            </div>
          )}
        </div>

        {whatsappUrl && (
          <div className="customer-order-whatsapp-box">
            <p className="customer-order-whatsapp-title">Precisa de ajuda?</p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="customer-order-whatsapp-button"
            >
              <MessageCircle size={16} />
              Chamar no WhatsApp
            </a>
          </div>
        )}

        <div className="order-details-footer">
          <button type="button" className="order-details-close-button" onClick={onClose}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
