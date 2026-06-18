import { useEffect, useState } from 'react';
import { RefreshCw, ClipboardList, ChevronRight } from 'lucide-react';
import { useAdminOrders } from '@/hooks/useAdminOrders';
import { AdminOrderDetailDrawer } from '../components/AdminOrderDetailDrawer';
import { formatBRL, getOrderTotal } from '@/utils/currency.util';
import { formatDateTime } from '@/utils/date.util';
import type { AdminOrderListItem, OrderStatus, PaymentStatus } from '@/types/order.types';

/* ── Mapas de label / cor ── */

const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  CREATED: 'Criado',
  AWAITING_PAYMENT: 'Ag. pagamento',
  PAID: 'Pago',
  PREPARING: 'Em preparo',
  OUT_FOR_DELIVERY: 'Em entrega',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
};

const ORDER_STATUS_COLOR: Record<OrderStatus, { bg: string; color: string }> = {
  CREATED:          { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
  AWAITING_PAYMENT: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b' },
  PAID:             { bg: 'rgba(76,175,80,0.15)',    color: '#4caf50' },
  PREPARING:        { bg: 'rgba(139,92,246,0.15)',   color: 'var(--roxo-c)' },
  OUT_FOR_DELIVERY: { bg: 'rgba(59,130,246,0.15)',   color: '#60a5fa' },
  DELIVERED:        { bg: 'rgba(76,175,80,0.15)',    color: '#4caf50' },
  CANCELED:         { bg: 'rgba(239,68,68,0.15)',    color: '#f87171' },
};

const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  FAILED: 'Falhou',
  CANCELED: 'Cancelado',
  EXPIRED: 'Expirado',
};

const PAYMENT_STATUS_COLOR: Record<string, { bg: string; color: string }> = {
  PENDING:  { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
  PAID:     { bg: 'rgba(76,175,80,0.15)',  color: '#4caf50' },
  FAILED:   { bg: 'rgba(239,68,68,0.15)', color: '#f87171' },
  CANCELED: { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
  EXPIRED:  { bg: 'rgba(150,150,150,0.15)', color: '#aaa' },
};

const PAYMENT_METHOD_LABEL: Record<string, string> = {
  PIX: 'PIX',
  CASH_ON_DELIVERY: 'Dinheiro',
  CARD_ON_DELIVERY: 'Cartão',
};

type FilterValue = OrderStatus | 'ALL';

const FILTERS: { label: string; value: FilterValue }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Criados', value: 'CREATED' },
  { label: 'Ag. pagamento', value: 'AWAITING_PAYMENT' },
  { label: 'Pagos', value: 'PAID' },
  { label: 'Em preparo', value: 'PREPARING' },
  { label: 'Em entrega', value: 'OUT_FOR_DELIVERY' },
  { label: 'Entregues', value: 'DELIVERED' },
  { label: 'Cancelados', value: 'CANCELED' },
];

/* ── Helpers ── */

function StatusBadge({ status, map }: { status: string; map: Record<string, { bg: string; color: string }> }) {
  const c = map[status] ?? { bg: 'rgba(150,150,150,0.15)', color: '#aaa' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 'var(--r-full)',
      fontSize: '0.72rem', fontWeight: 700,
      background: c.bg, color: c.color,
      border: `1px solid ${c.color}33`, whiteSpace: 'nowrap',
    }}>
      {ORDER_STATUS_LABEL[status as OrderStatus] ?? PAYMENT_STATUS_LABEL[status] ?? status}
    </span>
  );
}

function customerLabel(order: AdminOrderListItem) {
  return order.customerName ?? 'Cliente não informado';
}

/* ── Página ── */

export function AdminOrdersPage() {
  const {
    orders, selectedOrder, isLoading, isDetailLoading,
    loadOrders, openOrderDetail, closeOrderDetail,
    updateOrderStatus, updatePaymentStatus,
  } = useAdminOrders();

  const [filter, setFilter] = useState<FilterValue>('ALL');

  useEffect(() => { loadOrders(); }, []);

  const filtered = filter === 'ALL'
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Pedidos</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            {filtered.length} pedido{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={loadOrders}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 14px', background: 'var(--c2)', border: '1px solid var(--c3)',
            borderRadius: 'var(--r-md)', color: 'var(--t2)', cursor: isLoading ? 'not-allowed' : 'pointer',
            fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={14} style={isLoading ? { animation: 'spin 0.8s linear infinite' } : {}} />
          Atualizar
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', marginBottom: 16, paddingBottom: 4, scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            style={{
              flexShrink: 0, padding: '6px 14px',
              background: filter === f.value ? 'var(--roxo-v)' : 'var(--c2)',
              border: `1px solid ${filter === f.value ? 'var(--roxo-v)' : 'var(--c3)'}`,
              borderRadius: 'var(--r-full)', color: filter === f.value ? '#fff' : 'var(--t2)',
              fontWeight: 600, fontSize: '0.78rem', cursor: 'pointer', whiteSpace: 'nowrap',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)', fontSize: '0.875rem' }}>
          Carregando pedidos…
        </div>
      )}

      {/* Vazio */}
      {!isLoading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.3 }}>
            <ClipboardList size={40} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum pedido encontrado</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
            {filter === 'ALL'
              ? 'Ainda não há pedidos registrados.'
              : `Nenhum pedido com status "${ORDER_STATUS_LABEL[filter as OrderStatus] ?? filter}".`}
          </p>
        </div>
      )}

      {/* Cards (mobile) */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="ao-cards">
            {filtered.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                onClick={() => openOrderDetail(order.id)}
              />
            ))}
          </div>

          {/* Tabela (desktop) */}
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <Th>Pedido</Th>
                  <Th>Data/Hora</Th>
                  <Th>Cliente</Th>
                  <Th>Itens</Th>
                  <Th>Total</Th>
                  <Th>Pagamento</Th>
                  <Th>Status Pgto</Th>
                  <Th>Status Pedido</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id} className="ao-row" onClick={() => openOrderDetail(order.id)}>
                    <Td bold>#{order.orderNumber}</Td>
                    <Td muted>{formatDateTime(order.createdAt)}</Td>
                    <Td>{customerLabel(order)}</Td>
                    <Td muted>
                      {order.itemsCount != null ? `${order.itemsCount} item${order.itemsCount !== 1 ? 's' : ''}` : '—'}
                    </Td>
                    <Td bold>{formatBRL(getOrderTotal(order))}</Td>
                    <Td muted>{PAYMENT_METHOD_LABEL[order.paymentMethod as string] ?? order.paymentMethod ?? '—'}</Td>
                    <td style={tdStyle}>
                      <StatusBadge status={order.paymentStatus} map={PAYMENT_STATUS_COLOR} />
                    </td>
                    <td style={tdStyle}>
                      <StatusBadge status={order.orderStatus} map={ORDER_STATUS_COLOR} />
                    </td>
                    <td style={tdStyle}>
                      <ChevronRight size={16} style={{ color: 'var(--t2)', opacity: 0.5 }} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Drawer de detalhe */}
      <AdminOrderDetailDrawer
        order={selectedOrder}
        isLoading={isDetailLoading}
        onClose={closeOrderDetail}
        onUpdateStatus={updateOrderStatus}
        onUpdatePaymentStatus={updatePaymentStatus}
      />

      <style>{styles}</style>
    </div>
  );
}

/* ── Subcomponentes ── */

function OrderCard({ order, onClick }: { order: AdminOrderListItem; onClick: () => void }) {
  const statusC = ORDER_STATUS_COLOR[order.orderStatus] ?? ORDER_STATUS_COLOR.CREATED;
  const payC = PAYMENT_STATUS_COLOR[order.paymentStatus] ?? PAYMENT_STATUS_COLOR.PENDING;

  return (
    <div className="ao-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <p style={{ fontWeight: 800, fontSize: '0.95rem' }}>#{order.orderNumber}</p>
          <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginTop: 2 }}>{formatDateTime(order.createdAt)}</p>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
          background: statusC.bg, color: statusC.color, border: `1px solid ${statusC.color}33`,
        }}>
          {ORDER_STATUS_LABEL[order.orderStatus] ?? order.orderStatus}
        </span>
      </div>

      <p style={{ fontSize: '0.875rem', fontWeight: 500, marginBottom: 6 }}>{customerLabel(order)}</p>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          {order.itemsCount != null && (
            <span style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>
              {order.itemsCount} item{order.itemsCount !== 1 ? 's' : ''}
            </span>
          )}
          {order.paymentMethod && (
            <span style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>
              · {PAYMENT_METHOD_LABEL[order.paymentMethod as string] ?? order.paymentMethod}
            </span>
          )}
          <span style={{
            padding: '2px 8px', borderRadius: 'var(--r-full)', fontSize: '0.68rem', fontWeight: 700,
            background: payC.bg, color: payC.color, border: `1px solid ${payC.color}33`,
          }}>
            {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}
          </span>
        </div>
        <span style={{ fontWeight: 800, color: 'var(--am)', fontSize: '0.95rem' }}>
          {formatBRL(getOrderTotal(order))}
        </span>
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px', borderBottom: '1px solid var(--c3)',
  fontSize: '0.82rem', color: 'var(--txt)', verticalAlign: 'middle',
};

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th style={{
      padding: '10px 14px', textAlign: 'left',
      fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)',
      textTransform: 'uppercase', letterSpacing: 0.5,
      borderBottom: '2px solid var(--c3)', whiteSpace: 'nowrap',
      background: 'var(--c2)',
    }}>
      {children}
    </th>
  );
}

function Td({ children, bold, muted }: { children?: React.ReactNode; bold?: boolean; muted?: boolean }) {
  return (
    <td style={{ ...tdStyle, fontWeight: bold ? 700 : 400, color: muted ? 'var(--t2)' : 'var(--txt)' }}>
      {children ?? '—'}
    </td>
  );
}

const styles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .ao-cards { display: flex; flex-direction: column; gap: 10px; }
  .ao-table-wrap { display: none; }

  .ao-card {
    background: var(--c1);
    border: 1px solid var(--c3);
    border-radius: var(--r-md);
    padding: 14px;
    cursor: pointer;
    transition: border-color 0.15s;
  }
  .ao-card:hover { border-color: var(--roxo-v); }

  @media (min-width: 1024px) {
    .ao-cards      { display: none; }
    .ao-table-wrap {
      display: block;
      background: var(--c1);
      border: 1px solid var(--c3);
      border-radius: var(--r-md);
      overflow: hidden;
    }
    .ao-table { width: 100%; border-collapse: collapse; }
    .ao-row   { cursor: pointer; transition: background 0.1s; }
    .ao-row:hover { background: var(--c2); }
  }
`;
