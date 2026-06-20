import { useState, useEffect, useCallback, useRef } from 'react';
import { getAdminOrdersRequest } from '@/services/orders.service';
import type { AdminOrderListItem } from '@/types/order.types';

const REFRESH_INTERVAL_MS = 10_000;
const NEW_ORDER_HIGHLIGHT_MS = 6_000;

export function useDashboardOrders() {
  const [allOrders, setAllOrders] = useState<AdminOrderListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [toastVisible, setToastVisible] = useState(false);

  const knownIdsRef = useRef<Set<string>>(new Set());
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const highlightTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setIsLoading(true);
      const raw = await getAdminOrdersRequest();
      const orders: AdminOrderListItem[] = Array.isArray(raw) ? raw : [];

      if (knownIdsRef.current.size > 0) {
        const freshIds = orders
          .map((o) => o.id)
          .filter((id) => !knownIdsRef.current.has(id));

        if (freshIds.length > 0) {
          const ids = new Set(freshIds);
          setNewOrderIds(ids);
          setToastVisible(true);

          if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
          if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);

          toastTimerRef.current = setTimeout(() => setToastVisible(false), NEW_ORDER_HIGHLIGHT_MS);
          highlightTimerRef.current = setTimeout(
            () => setNewOrderIds(new Set()),
            NEW_ORDER_HIGHLIGHT_MS,
          );
        }
      }

      orders.forEach((o) => knownIdsRef.current.add(o.id));
      setAllOrders(orders);
      setLastUpdated(new Date());
    } catch {
      // manter dados anteriores em caso de erro
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchOrders();
    const interval = setInterval(() => void fetchOrders(true), REFRESH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (highlightTimerRef.current) clearTimeout(highlightTimerRef.current);
    };
  }, [fetchOrders]);

  return { allOrders, isLoading, lastUpdated, newOrderIds, toastVisible };
}
