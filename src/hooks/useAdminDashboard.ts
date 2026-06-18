import { useState } from 'react';
import { getDashboardSummaryRequest, getPendingOrdersRequest } from '@/services/admin.service';
import type { DashboardSummary } from '@/types/admin.types';
import type { Order } from '@/types/order.types';

export function useAdminDashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const [summaryData, pendingData] = await Promise.allSettled([
        getDashboardSummaryRequest(),
        getPendingOrdersRequest(),
      ]);
      if (summaryData.status === 'fulfilled') setSummary(summaryData.value);
      if (pendingData.status === 'fulfilled') setPendingOrders(pendingData.value ?? []);
    } catch {
      setError('Erro ao carregar dashboard');
    } finally {
      setIsLoading(false);
    }
  }

  return { summary, pendingOrders, isLoading, error, loadDashboard };
}
