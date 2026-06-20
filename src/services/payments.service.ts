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
