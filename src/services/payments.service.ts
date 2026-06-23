import { api } from './api';

function unwrap<T>(response: { data: unknown }): T {
  const d = response.data as { data?: T } | T;
  return ((d as { data?: T }).data ?? d) as T;
}

export async function createPixPaymentRequest(orderId: string): Promise<unknown> {
  const response = await api.post(`/payments/order/${orderId}/pix`, {});
  return unwrap<unknown>(response);
}

export async function getPaymentByOrderIdRequest(orderId: string): Promise<unknown> {
  const response = await api.get(`/payments/order/${orderId}`);
  return unwrap<unknown>(response);
}

// ── PIX sync ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapAny(response: any): any {
  return response?.data?.data ?? response?.data ?? response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncMyOrderPixPaymentRequest(orderId: string): Promise<any> {
  const response = await api.post(`/payments/my/order/${orderId}/pix/sync`);
  return unwrapAny(response);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncAdminPendingPixPaymentsRequest(): Promise<any> {
  const response = await api.post('/admin/payments/pix/inter/sync-pending');
  return unwrapAny(response);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function syncAdminPixPaymentRequest(paymentId: string): Promise<any> {
  const response = await api.post(`/admin/payments/pix/inter/sync/${paymentId}`);
  return unwrapAny(response);
}
