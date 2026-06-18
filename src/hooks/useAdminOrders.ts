import { useState } from 'react';
import {
  getAdminOrdersRequest,
  getAdminOrderByIdRequest,
  updateOrderStatusRequest,
  updateOrderPaymentStatusRequest,
} from '@/services/orders.service';
import type { AdminOrderListItem, AdminOrderDetail, OrderStatus, PaymentStatus } from '@/types/order.types';

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrderListItem[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const data = await getAdminOrdersRequest();
      setOrders(data ?? []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function openOrderDetail(id: string) {
    setIsDetailLoading(true);
    try {
      const data = await getAdminOrderByIdRequest(id);
      setSelectedOrder(data);
    } catch {
      setSelectedOrder(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeOrderDetail() {
    setSelectedOrder(null);
  }

  async function refreshSelectedOrder() {
    if (!selectedOrder) return;
    setIsDetailLoading(true);
    try {
      const data = await getAdminOrderByIdRequest(selectedOrder.id);
      setSelectedOrder(data);
    } catch {
      // mantém o estado atual
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    await updateOrderStatusRequest(id, status);
    await loadOrders();
    if (selectedOrder?.id === id) await refreshSelectedOrder();
  }

  async function updatePaymentStatus(id: string, status: PaymentStatus) {
    await updateOrderPaymentStatusRequest(id, status);
    await loadOrders();
    if (selectedOrder?.id === id) await refreshSelectedOrder();
  }

  return {
    orders,
    selectedOrder,
    isLoading,
    isDetailLoading,
    loadOrders,
    openOrderDetail,
    closeOrderDetail,
    updateOrderStatus,
    updatePaymentStatus,
    refreshSelectedOrder,
  };
}
