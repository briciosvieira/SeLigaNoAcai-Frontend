import type { Order } from '@/types/order.types';
import { formatBRL } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import {
  getOrderTotal,
  getOrderStatusLabel,
  getOrderStatusClass,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from '@/utils/order.util';

interface CustomerOrderCardProps {
  order: Order;
  onViewDetails: () => void;
}

export function CustomerOrderCard({ order, onViewDetails }: CustomerOrderCardProps) {
  const total = getOrderTotal(order);
  const formattedDate = formatDateTime(order.createdAt);
  const statusLabel = getOrderStatusLabel(order.orderStatus ?? order.status);
  const statusClass = getOrderStatusClass(order.orderStatus ?? order.status);
  const paymentMethodLabel = getPaymentMethodLabel(order.paymentMethod ?? undefined);
  const paymentStatusLabel = getPaymentStatusLabel(order.paymentStatus ?? undefined);
  const itemsCount = order.items?.length ?? 0;
  const items = order.items ?? [];

  return (
    <article className="customer-order-card">
      <div className="customer-order-card-header">
        <div>
          <span className="customer-order-label">Pedido</span>
          <h3 className="customer-order-number">#{order.orderNumber}</h3>
          <p className="customer-order-date">{formattedDate}</p>
        </div>

        <div className="customer-order-total-area">
          <strong className="customer-order-total">{formatBRL(total)}</strong>
          <span className={`customer-order-status ${statusClass}`}>
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="customer-order-info-grid">
        <div>
          <span>Pagamento</span>
          <strong>{paymentMethodLabel}</strong>
        </div>

        <div>
          <span>Status do pagamento</span>
          <strong>{paymentStatusLabel}</strong>
        </div>

        <div>
          <span>Itens</span>
          <strong>{itemsCount} item(ns)</strong>
        </div>
      </div>

      {items.length > 0 && (
        <div className="customer-order-items-preview">
          {items.slice(0, 3).map((item) => (
            <div key={item.id} className="customer-order-item-preview">
              <span>{item.quantity}x {item.productName}</span>
              <strong>{formatBRL(Number(item.totalAmount ?? 0))}</strong>
            </div>
          ))}
          {items.length > 3 && (
            <div className="customer-order-item-preview">
              <span>... e mais {items.length - 3} item(ns)</span>
            </div>
          )}
        </div>
      )}

      <button className="customer-order-details-button" onClick={onViewDetails}>
        Ver detalhes
      </button>
    </article>
  );
}