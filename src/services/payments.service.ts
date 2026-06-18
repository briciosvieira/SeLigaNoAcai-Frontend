import { api } from './api';
import type { PixPaymentData } from '@/types/order.types';

export async function createPixPaymentRequest(orderId: string): Promise<PixPaymentData> {
  const response = await api.post(`/payments/order/${orderId}/pix`, {});
  const d = response.data as { data?: PixPaymentData } | PixPaymentData;
  return ((d as { data?: PixPaymentData }).data ?? d) as PixPaymentData;
}
