import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomerOrderCard } from '../components/CustomerOrderCard';
import { CustomerOrderDetailsModal } from '../components/CustomerOrderDetailsModal';
import { ClipboardList } from 'lucide-react';
import { syncMyOrderPixPaymentRequest } from '@/services/payments.service';
import type { Order } from '@/types/order.types';
import './OrdersPage.css';

// ── helpers ──────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getOrderPayments(order: any) {
  if (Array.isArray(order?.payments)) return order.payments;
  if (order?.payment) return [order.payment];
  return [];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getPixPayment(order: any) {
  return getOrderPayments(order).find((p: any) => {
    const method = String(
      p?.paymentMethod ?? p?.method ?? order?.paymentMethod ?? '',
    ).toUpperCase();
    return method === 'PIX';
  });
}

function isPendingPixOrder(order: Order): boolean {
  const payment = getPixPayment(order);
  const status = String(payment?.status ?? order?.paymentStatus ?? '').toUpperCase();
  return Boolean(payment) && status === 'PENDING';
}

function isPaidStatus(status?: string | null): boolean {
  return String(status ?? '').toUpperCase() === 'PAID';
}

// ── component ─────────────────────────────────────────────────────────────

export function OrdersPage() {
  const { orders, isLoading, error, loadMyOrders, mergeOrderDetail } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    void loadMyOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSyncPixPayment(orderId: string) {
    setSyncingOrderId(orderId);
    setSyncMessage(null);
    setSyncError(null);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result: any = await syncMyOrderPixPaymentRequest(orderId);
      const currentStatus = result?.currentStatus as string | undefined;

      if (isPaidStatus(currentStatus)) {
        setSyncMessage('Pagamento confirmado! Seu pedido foi atualizado.');
        await loadMyOrders();
        // Se o modal estava aberto para este pedido, atualiza o selectedOrder também
        if (selectedOrder?.id === orderId) {
          setSelectedOrder((prev) =>
            prev ? { ...prev, paymentStatus: 'PAID' } : null,
          );
        }
      } else {
        setSyncMessage(result?.message ?? 'Pagamento ainda pendente. Tente novamente em instantes.');
        // Atualiza localmente sem recarregar tudo
        const target = orders.find((o) => o.id === orderId);
        if (target) {
          const merged: Order = {
            ...target,
            paymentStatus: currentStatus
              ? (currentStatus as Order['paymentStatus'])
              : target.paymentStatus,
          };
          mergeOrderDetail(merged);
          if (selectedOrder?.id === orderId) {
            setSelectedOrder(merged);
          }
        }
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { message?: string; error?: string } }; message?: string };
      const httpStatus = e?.response?.status;
      const backendMsg = e?.response?.data?.message ?? e?.response?.data?.error ?? e?.message;

      if (httpStatus === 429) {
        setSyncError(backendMsg ?? 'Aguarde 15 segundos antes de consultar novamente.');
      } else {
        setSyncError(
          backendMsg ?? 'Não foi possível verificar o pagamento agora. Tente novamente em instantes.',
        );
      }
    } finally {
      setSyncingOrderId(null);
    }
  }

  function handleViewDetails(order: Order) {
    setSyncMessage(null);
    setSyncError(null);
    setSelectedOrder(order);
  }

  function handleCloseModal() {
    setSelectedOrder(null);
  }

  if (isLoading && orders.length === 0) {
    return <FullPageSpinner text="Carregando seus pedidos..." />;
  }

  if (error && orders.length === 0) {
    return (
      <div className="customer-orders-page">
        <EmptyState
          icon={<ClipboardList size={48} />}
          title="Não foi possível carregar seus pedidos"
          description={error}
          action={
            <button onClick={loadMyOrders} className="customer-order-details-button">
              Tentar novamente
            </button>
          }
        />
      </div>
    );
  }

  return (
    <>
      <main className="customer-orders-page">
        <div className="customer-orders-header">
          <h1 className="customer-orders-title">Meus Pedidos</h1>
          <p className="customer-orders-subtitle">
            Acompanhe o status e o histórico dos seus pedidos.
          </p>
        </div>

        {syncMessage && (
          <div className="order-pix-sync-alert success">{syncMessage}</div>
        )}
        {syncError && (
          <div className="order-pix-sync-alert error">{syncError}</div>
        )}

        {orders.length === 0 ? (
          <EmptyState
            icon={<ClipboardList size={48} />}
            title="Você ainda não fez nenhum pedido"
            description="Escolha seu açaí favorito e acompanhe tudo por aqui."
            action={
              <Link to="/" className="customer-order-details-button">
                Ver cardápio
              </Link>
            }
          />
        ) : (
          <div className="customer-orders-list">
            {orders.map((order) => (
              <CustomerOrderCard
                key={order.id}
                order={order}
                onViewDetails={() => handleViewDetails(order)}
                onSyncPix={isPendingPixOrder(order) ? handleSyncPixPayment : undefined}
                isSyncing={syncingOrderId === order.id}
              />
            ))}
          </div>
        )}
      </main>

      {selectedOrder && (
        <CustomerOrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
          onDetailLoaded={mergeOrderDetail}
          onSyncPix={handleSyncPixPayment}
          syncingOrderId={syncingOrderId}
        />
      )}
    </>
  );
}
