import { useState, useMemo } from 'react';
import { useDashboardOrders } from '@/hooks/useDashboardOrders';
import { formatBRL, getOrderTotal } from '@/utils/currency.util';
import type { AdminOrderListItem } from '@/types/order.types';
import './AdminDashboardPage.css';

/* ── Status normalization ── */

type NormalizedStatus =
  | 'NEW'
  | 'PREPARING'
  | 'READY'
  | 'IN_TRANSIT'
  | 'DELIVERED'
  | 'CANCELED'
  | 'UNKNOWN';

function normalizeOrderStatus(status: string): NormalizedStatus {
  const s = String(status).toUpperCase();
  if (['CREATED', 'NEW', 'RECEIVED', 'PENDING', 'AWAITING_PAYMENT', 'PAID'].includes(s))
    return 'NEW';
  if (['PREPARING', 'IN_PREPARATION'].includes(s)) return 'PREPARING';
  if (['READY', 'DONE', 'COMPLETED'].includes(s)) return 'READY';
  if (['OUT_FOR_DELIVERY', 'IN_TRANSIT'].includes(s)) return 'IN_TRANSIT';
  if (['DELIVERED', 'FINISHED'].includes(s)) return 'DELIVERED';
  if (['CANCELED', 'CANCELLED'].includes(s)) return 'CANCELED';
  return 'UNKNOWN';
}

const STATUS_LABEL: Record<NormalizedStatus, string> = {
  NEW: 'Novo',
  PREPARING: 'Em preparo',
  READY: 'Pronto',
  IN_TRANSIT: 'Em trânsito',
  DELIVERED: 'Entregue',
  CANCELED: 'Cancelado',
  UNKNOWN: 'Desconhecido',
};

/* ── Helpers ── */

function formatPaymentMethod(method: string | null | undefined): string {
  if (!method) return '—';
  const m = String(method).toUpperCase();
  if (m === 'PIX') return 'PIX';
  if (m === 'CASH_ON_DELIVERY') return 'Dinheiro';
  if (m === 'CARD_ON_DELIVERY') return 'Cartão (entrega)';
  return method;
}

function formatPaymentStatus(status: string | null | undefined): string {
  if (!status) return '—';
  const s = String(status).toUpperCase();
  if (s === 'PAID') return 'Pago';
  if (s === 'PENDING') return 'Pendente';
  if (s === 'FAILED') return 'Falhou';
  if (s === 'CANCELED') return 'Cancelado';
  if (s === 'EXPIRED') return 'Expirado';
  return status;
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function formatOrderTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function isToday(dateStr: string): boolean {
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return (
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate()
    );
  } catch {
    return false;
  }
}

/* ── Date filter ── */

type DatePreset = 'today' | 'yesterday' | '7days' | 'month' | 'custom';
type StatusFilter =
  | 'all'
  | 'open'
  | 'new'
  | 'preparing'
  | 'in_transit'
  | 'delivered'
  | 'canceled';

const OPEN_STATUSES: NormalizedStatus[] = ['NEW', 'PREPARING', 'READY', 'IN_TRANSIT'];

function filterByDate(
  orders: AdminOrderListItem[],
  preset: DatePreset,
  customFrom: string,
  customTo: string,
): AdminOrderListItem[] {
  const now = new Date();
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const today = startOfDay(now);

  let from: Date;
  let to: Date = now;

  switch (preset) {
    case 'today':
      from = today;
      break;
    case 'yesterday': {
      const y = new Date(today);
      y.setDate(y.getDate() - 1);
      from = y;
      to = new Date(today.getTime() - 1);
      break;
    }
    case '7days': {
      const f = new Date(today);
      f.setDate(f.getDate() - 6);
      from = f;
      break;
    }
    case 'month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      break;
    case 'custom':
      from = customFrom ? new Date(customFrom) : today;
      to = customTo ? new Date(new Date(customTo).setHours(23, 59, 59, 999)) : now;
      break;
  }

  return orders.filter((o) => {
    try {
      const d = new Date(o.createdAt);
      return d >= from && d <= to;
    } catch {
      return false;
    }
  });
}

function filterByStatus(
  orders: AdminOrderListItem[],
  filter: StatusFilter,
): AdminOrderListItem[] {
  if (filter === 'all') return orders;
  return orders.filter((o) => {
    const norm = normalizeOrderStatus(o.orderStatus);
    switch (filter) {
      case 'open':
        return OPEN_STATUSES.includes(norm);
      case 'new':
        return norm === 'NEW';
      case 'preparing':
        return norm === 'PREPARING';
      case 'in_transit':
        return norm === 'IN_TRANSIT' || norm === 'READY';
      case 'delivered':
        return norm === 'DELIVERED';
      case 'canceled':
        return norm === 'CANCELED';
      default:
        return true;
    }
  });
}

/* ── Sub-components ── */

function SummaryCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: 'green' | 'orange' | 'blue' | 'red' | 'yellow';
}) {
  return (
    <div className="admin-dashboard-summary-card">
      <p className="admin-dashboard-summary-label">{label}</p>
      <p className={`admin-dashboard-summary-value${accent ? ` accent-${accent}` : ''}`}>
        {value}
      </p>
    </div>
  );
}

function StatusBadge({ norm }: { norm: NormalizedStatus }) {
  return (
    <span className={`admin-dashboard-status-badge status-${norm.toLowerCase()}`}>
      {STATUS_LABEL[norm]}
    </span>
  );
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="admin-dashboard-order-meta-item">
      <span>{label}</span>
      <strong>{children}</strong>
    </div>
  );
}

function OrderCard({
  order,
  norm,
  isNew,
}: {
  order: AdminOrderListItem;
  norm: NormalizedStatus;
  isNew: boolean;
}) {
  const customerName = order.customerName ?? 'Cliente';

  return (
    <div
      className={[
        'admin-dashboard-order-card',
        `status-${norm.toLowerCase()}`,
        isNew ? 'is-newly-received' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <div className="admin-dashboard-order-top">
        <div className="admin-dashboard-order-left">
          <span className="admin-dashboard-order-number">#{order.orderNumber}</span>
          {isNew && <span className="admin-dashboard-new-badge">NOVO</span>}
        </div>
        <div className="admin-dashboard-order-right">
          <span className="admin-dashboard-order-time">{formatOrderTime(order.createdAt)}</span>
          <span className="admin-dashboard-order-total">{formatBRL(getOrderTotal(order))}</span>
        </div>
      </div>

      <div className="admin-dashboard-order-customer">
        <span className="admin-dashboard-order-customer-name">{customerName}</span>
        {order.customerPhone && (
          <span className="admin-dashboard-order-customer-phone">{order.customerPhone}</span>
        )}
      </div>

      <div className="admin-dashboard-order-meta">
        <MetaItem label="Itens">
          {order.itemsCount != null ? `${order.itemsCount} item${order.itemsCount !== 1 ? 's' : ''}` : '—'}
        </MetaItem>
        <MetaItem label="Pagamento">{formatPaymentMethod(order.paymentMethod)}</MetaItem>
        <MetaItem label="Status Pag.">{formatPaymentStatus(order.paymentStatus)}</MetaItem>
        <MetaItem label="Pedido">
          <StatusBadge norm={norm} />
        </MetaItem>
      </div>
    </div>
  );
}

/* ── Date preset configs ── */

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: 'today', label: 'Hoje' },
  { key: 'yesterday', label: 'Ontem' },
  { key: '7days', label: 'Últimos 7 dias' },
  { key: 'month', label: 'Este mês' },
  { key: 'custom', label: 'Personalizado' },
];

const STATUS_CHIPS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'Todos' },
  { key: 'open', label: 'Abertos' },
  { key: 'new', label: 'Novos' },
  { key: 'preparing', label: 'Em preparo' },
  { key: 'in_transit', label: 'Em trânsito' },
  { key: 'delivered', label: 'Entregues' },
  { key: 'canceled', label: 'Cancelados' },
];

/* ── Main page ── */

export function AdminDashboardPage() {
  const { allOrders, isLoading, lastUpdated, newOrderIds, toastVisible } = useDashboardOrders();

  const [datePreset, setDatePreset] = useState<DatePreset>('today');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  /* Pedidos de hoje (independente do filtro) */
  const todayOrders = useMemo(
    () => allOrders.filter((o) => isToday(o.createdAt)),
    [allOrders],
  );

  /* Pedidos filtrados por data */
  const dateFiltred = useMemo(
    () => filterByDate(allOrders, datePreset, customFrom, customTo),
    [allOrders, datePreset, customFrom, customTo],
  );

  /* Pedidos exibidos na lista (data + status) */
  const displayedOrders = useMemo(
    () => filterByStatus(dateFiltred, statusFilter),
    [dateFiltred, statusFilter],
  );

  /* ── Summary stats ── */
  const openCount = useMemo(
    () => allOrders.filter((o) => OPEN_STATUSES.includes(normalizeOrderStatus(o.orderStatus))).length,
    [allOrders],
  );
  const newCount = useMemo(
    () => allOrders.filter((o) => normalizeOrderStatus(o.orderStatus) === 'NEW').length,
    [allOrders],
  );
  const preparingCount = useMemo(
    () => allOrders.filter((o) => normalizeOrderStatus(o.orderStatus) === 'PREPARING').length,
    [allOrders],
  );
  const deliveredTodayCount = useMemo(
    () => todayOrders.filter((o) => normalizeOrderStatus(o.orderStatus) === 'DELIVERED').length,
    [todayOrders],
  );
  const canceledTodayCount = useMemo(
    () => todayOrders.filter((o) => normalizeOrderStatus(o.orderStatus) === 'CANCELED').length,
    [todayOrders],
  );
  const todayRevenue = useMemo(
    () =>
      todayOrders
        .filter((o) => normalizeOrderStatus(o.orderStatus) !== 'CANCELED')
        .reduce((sum, o) => sum + getOrderTotal(o), 0),
    [todayOrders],
  );
  const periodRevenue = useMemo(
    () =>
      dateFiltred
        .filter((o) => normalizeOrderStatus(o.orderStatus) !== 'CANCELED')
        .reduce((sum, o) => sum + getOrderTotal(o), 0),
    [dateFiltred],
  );
  const avgTicket = useMemo(
    () => (dateFiltred.length > 0 ? periodRevenue / dateFiltred.length : 0),
    [dateFiltred, periodRevenue],
  );

  return (
    <div className="admin-dashboard-page">
      {/* Toast novo pedido */}
      <div className={`admin-dashboard-toast${toastVisible ? ' visible' : ''}`}>
        🔔 Novo pedido recebido!
      </div>

      {/* Header */}
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-subtitle">Monitor de pedidos em tempo real</p>
        </div>
        <div className="admin-dashboard-live-badge">
          <span className="admin-dashboard-live-dot" />
          {isLoading && !lastUpdated
            ? 'Carregando…'
            : lastUpdated
              ? `Atualizado ${formatTime(lastUpdated)}`
              : 'Online'}
        </div>
      </div>

      {/* Summary cards */}
      <div className="admin-dashboard-summary-grid">
        <SummaryCard label="Pedidos abertos" value={openCount} accent="green" />
        <SummaryCard label="Novos / pendentes" value={newCount} accent="green" />
        <SummaryCard label="Em preparo" value={preparingCount} accent="orange" />
        <SummaryCard label="Entregues hoje" value={deliveredTodayCount} accent="blue" />
        <SummaryCard label="Vendas hoje" value={formatBRL(todayRevenue)} accent="yellow" />
        <SummaryCard label="Total período" value={formatBRL(periodRevenue)} />
        <SummaryCard label="Ticket médio" value={formatBRL(avgTicket)} />
        <SummaryCard label="Cancelados hoje" value={canceledTodayCount} accent="red" />
      </div>

      {/* Filtros de data */}
      <div className="admin-dashboard-filter-row">
        {DATE_PRESETS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`admin-dashboard-filter-chip${datePreset === key ? ' active' : ''}`}
            onClick={() => setDatePreset(key)}
          >
            {label}
          </button>
        ))}
        {datePreset === 'custom' && (
          <div className="admin-dashboard-date-range">
            <input
              type="date"
              className="admin-dashboard-date-input"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
            />
            <span className="admin-dashboard-date-sep">até</span>
            <input
              type="date"
              className="admin-dashboard-date-input"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Filtros por status */}
      <div className="admin-dashboard-filter-row">
        {STATUS_CHIPS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            className={`admin-dashboard-filter-chip${statusFilter === key ? ' active' : ''}`}
            onClick={() => setStatusFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Lista de pedidos */}
      <div className="admin-dashboard-orders-section">
        <h2 className="admin-dashboard-orders-title">
          Pedidos{' '}
          <span className="admin-dashboard-orders-count">({displayedOrders.length})</span>
        </h2>

        {isLoading && allOrders.length === 0 ? (
          <p className="admin-dashboard-loading">Carregando pedidos…</p>
        ) : displayedOrders.length === 0 ? (
          <p className="admin-dashboard-empty">
            Nenhum pedido encontrado para o filtro selecionado.
          </p>
        ) : (
          <div className="admin-dashboard-orders-list">
            {displayedOrders.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                norm={normalizeOrderStatus(order.orderStatus)}
                isNew={newOrderIds.has(order.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
