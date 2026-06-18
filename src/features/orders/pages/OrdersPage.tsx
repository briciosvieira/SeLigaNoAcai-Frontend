import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useOrders } from '@/hooks/useOrders';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { CustomerOrderCard } from '../components/CustomerOrderCard';
import { CustomerOrderDetailsModal } from '../components/CustomerOrderDetailsModal';
import { ClipboardList } from 'lucide-react';
import type { Order } from '@/types/order.types';
import './OrdersPage.css';

export function OrdersPage() {
  const { orders, isLoading, error, loadMyOrders } = useOrders();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadMyOrders();
  }, []);

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleCloseModal = () => {
    setSelectedOrder(null);
  };

  if (isLoading) {
    return <FullPageSpinner text="Carregando seus pedidos..." />;
  }

  if (error) {
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
              />
            ))}
          </div>
        )}
      </main>

      {selectedOrder && (
        <CustomerOrderDetailsModal
          order={selectedOrder}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
