export function formatBRL(value: unknown): string {
  const num =
    typeof value === 'number' ? value :
    typeof value === 'string' ? Number(value) : 0;
  if (!Number.isFinite(num)) return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
}

export const formatCurrency = formatBRL;

export function parseCurrency(value: string): number {
  return parseFloat(value.replace(/[^0-9,]/g, '').replace(',', '.')) || 0;
}

export function getOrderTotal(order: {
  totalAmount?: unknown;
  total?: unknown;
  finalAmount?: unknown;
  orderTotal?: unknown;
}): number {
  const val = order.totalAmount ?? order.total ?? order.finalAmount ?? order.orderTotal ?? 0;
  const num = typeof val === 'number' ? val : Number(val);
  return Number.isFinite(num) ? num : 0;
}
