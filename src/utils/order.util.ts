import type { Order } from '@/types/order.types';

/**
 * Obtém o valor total de um pedido de forma segura,
 * verificando múltiplos campos possíveis.
 */
export function getOrderTotal(order: Partial<Order>): number {
  const possibleValues = [
    order.totalAmount,
    order.total,
    order.subtotalAmount,
    order.subtotal,
  ];

  const value = possibleValues.find((item) => {
    const parsed = Number(item);
    return Number.isFinite(parsed) && parsed > 0;
  });

  return Number(value ?? 0);
}

/**
 * Retorna a label amigável para um status de pedido.
 */
export function getOrderStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    CREATED: 'Pedido criado',
    AWAITING_PAYMENT: 'Aguardando pagamento',
    PAID: 'Pago',
    PREPARING: 'Em preparo',
    OUT_FOR_DELIVERY: 'Saiu para entrega',
    DELIVERED: 'Entregue',
    CANCELED: 'Cancelado',
  };

  return labels[status ?? ''] ?? 'Status não informado';
}

/**
 * Retorna a classe CSS para um status de pedido.
 */
export function getOrderStatusClass(status?: string): string {
  const classes: Record<string, string> = {
    CREATED: 'created',
    AWAITING_PAYMENT: 'awaiting-payment',
    PAID: 'paid',
    PREPARING: 'preparing',
    OUT_FOR_DELIVERY: 'out-for-delivery',
    DELIVERED: 'delivered',
    CANCELED: 'canceled',
  };

  return classes[status ?? ''] ?? 'unknown';
}

/**
 * Retorna a label amigável para um status de pagamento.
 */
export function getPaymentStatusLabel(status?: string): string {
  const labels: Record<string, string> = {
    PENDING: 'Pagamento pendente',
    PAID: 'Pagamento confirmado',
    FAILED: 'Pagamento falhou',
    REFUNDED: 'Reembolsado',
    CANCELED: 'Pagamento cancelado',
  };

  return labels[status ?? ''] ?? 'Pagamento não informado';
}

/**
 * Retorna a label amigável para uma forma de pagamento.
 */
export function getPaymentMethodLabel(method?: string): string {
  const labels: Record<string, string> = {
    PIX: 'PIX',
    CARD_ON_DELIVERY: 'Cartão na entrega',
    CASH_ON_DELIVERY: 'Dinheiro na entrega',
    CREDIT_ONLINE: 'Cartão online',
  };

  return labels[method ?? ''] ?? 'Não informado';
}

type OrderAny = Record<string, unknown>;

/**
 * Extrai o array de itens de um pedido, cobrindo variações de campo da API.
 */
export function getOrderItems(order: OrderAny): OrderAny[] {
  if (Array.isArray(order.items) && (order.items as unknown[]).length > 0) {
    return order.items as OrderAny[];
  }
  if (Array.isArray(order.orderItems)) return order.orderItems as OrderAny[];
  if (Array.isArray(order.products)) return order.products as OrderAny[];
  return [];
}

/**
 * Retorna a contagem total de itens (somando quantity de cada linha),
 * ou null quando nenhum dado de itens está disponível.
 */
export function getOrderItemsCount(order: OrderAny): number | null {
  const items = getOrderItems(order);
  if (items.length > 0) {
    return items.reduce((sum, item) => {
      const qty = Number(item.quantity ?? 1);
      return sum + (Number.isFinite(qty) && qty > 0 ? qty : 1);
    }, 0);
  }

  const countObj = order._count as OrderAny | undefined;
  const raw =
    countObj?.items ??
    order.itemsCount ??
    order.orderItemsCount ??
    null;

  if (raw === null || raw === undefined) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}