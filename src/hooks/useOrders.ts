import { useState } from 'react';
import { getMyOrdersRequest, getMyOrderByIdRequest } from '@/services/orders.service';
import type { Order } from '@/types/order.types';

export function useOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadMyOrders() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyOrdersRequest();
      setOrders(data ?? []);
    } catch {
      setError('Erro ao carregar pedidos');
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function loadOrderById(id: string) {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMyOrderByIdRequest(id);
      setSelectedOrder(data);
      return data;
    } catch {
      setError('Erro ao carregar pedido');
    } finally {
      setIsLoading(false);
    }
  }

  return { orders, selectedOrder, isLoading, error, loadMyOrders, loadOrderById };
}
