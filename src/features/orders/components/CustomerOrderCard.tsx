import { formatBRL } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import {
  getOrderTotal,
  getOrderStatusLabel,
  getOrderStatusClass,
  getPaymentStatusLabel,
  getPaymentMethodLabel,
  getOrderItems,
  getOrderItemsCount,
} from '@/utils/order.util';
import type { Order } from '@/types/order.types';

interface Props {
  order: Order;
  onViewDetails: () => void;
}

export function CustomerOrderCard({ order, onViewDetails }: Props) {
  const orderAny = order as Record<string, unknown>;

  const total = getOrderTotal(order);
  const statusLabel = getOrderStatusLabel(order.orderStatus ?? order.status);
  const statusClass = getOrderStatusClass(order.orderStatus ?? order.status);
  const paymentMethodLabel = getPaymentMethodLabel(
    typeof order.paymentMethod === 'string' ? order.paymentMethod : undefined,
  );
  const paymentStatusLabel = getPaymentStatusLabel(
    typeof order.paymentStatus === 'string' ? order.paymentStatus : undefined,
  );
  const formattedDate = order.createdAt ? formatDateTime(order.createdAt) : '–';

  const items = getOrderItems(orderAny);
  const itemsCount = getOrderItemsCount(orderAny);

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
          <span className={`customer-order-status ${statusClass}`}>{statusLabel}</span>
        </div>
      </div>

      <div className="customer-order-info-grid">
        <div>
          <span>Pagamento</span>
          <strong>{paymentMethodLabel}</strong>
        </div>
        <div>
          <span>Status pag.</span>
          <strong>{paymentStatusLabel}</strong>
        </div>
        <div>
          <span>Itens</span>
          <strong>
            {itemsCount === null
              ? 'Não carregados'
              : `${itemsCount} ${itemsCount === 1 ? 'item' : 'itens'}`}
          </strong>
        </div>
      </div>

      {items.length > 0 && (
        <div className="customer-order-items-preview">
          {items.slice(0, 3).map((item, idx) => {
            const name =
              typeof item.productName === 'string'
                ? item.productName
                : String((item.product as Record<string, unknown> | undefined)?.name ?? 'Produto');
            const qty = Number(item.quantity ?? 1);
            const lineTotal = item.totalAmount ?? item.total ?? 0;

            return (
              <div
                className="customer-order-item-preview"
                key={String(item.id ?? idx)}
              >
                <span>
                  {qty}x {name}
                </span>
                <strong>{formatBRL(lineTotal)}</strong>
              </div>
            );
          })}

          {items.length > 3 && (
            <span className="customer-order-more-items">
              +{items.length - 3} outro(s) item(ns)
            </span>
          )}
        </div>
      )}

      <button
        type="button"
        className="customer-order-details-button"
        onClick={onViewDetails}
      >
        Ver detalhes
      </button>
    </article>
  );
}
