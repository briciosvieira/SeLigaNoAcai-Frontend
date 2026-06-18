import { api } from './api';
import type {
  Order,
  CreateOrderPayload,
  AdminOrderListItem,
  AdminOrderDetail,
  OrderStatus,
  PaymentStatus,
} from '@/types/order.types';

/* ── Customer ── */

export async function createOrderRequest(payload: CreateOrderPayload): Promise<Order> {
  const response = await api.post('/orders', payload);
  return response.data.data;
}

export async function getMyOrdersRequest(): Promise<Order[]> {
  const response = await api.get('/orders/my-orders');
  return response.data.data;
}

export async function getMyOrderByIdRequest(id: string): Promise<Order> {
  const response = await api.get(`/orders/my-orders/${id}`);
  return response.data.data;
}

/* ── Admin ── */

export async function getAdminOrdersRequest(): Promise<AdminOrderListItem[]> {
  const response = await api.get('/orders');
  return response.data.data;
}

export async function getAdminOrderByIdRequest(id: string): Promise<AdminOrderDetail> {
  const response = await api.get(`/orders/${id}`);
  return response.data.data;
}

export async function updateOrderStatusRequest(
  id: string,
  orderStatus: OrderStatus,
): Promise<AdminOrderDetail> {
  const response = await api.patch(`/orders/${id}/status`, { orderStatus });
  return response.data.data;
}

export async function updateOrderPaymentStatusRequest(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<AdminOrderDetail> {
  const response = await api.patch(`/orders/${id}/payment-status`, { paymentStatus });
  return response.data.data;
}
