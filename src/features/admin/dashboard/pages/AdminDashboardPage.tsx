import { useEffect } from 'react';
import { useAdminDashboard } from '@/hooks/useAdminDashboard';
import { FullPageSpinner } from '@/components/ui/Spinner';
import { formatBRL, getOrderTotal } from '@/utils/currency.util';
import { ShoppingBag, Users, DollarSign, Clock } from 'lucide-react';

export function AdminDashboardPage() {
  const { summary, pendingOrders, isLoading, loadDashboard } = useAdminDashboard();

  useEffect(() => {
    loadDashboard();
  }, []);

  if (isLoading) return <FullPageSpinner />;

  return (
    <div>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 20 }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 24 }}>
        <StatCard
          icon={<ShoppingBag size={20} />}
          label="Total Pedidos"
          value={summary?.totalOrders ?? '—'}
          color="var(--roxo-v)"
        />
        <StatCard
          icon={<Clock size={20} />}
          label="Pendentes"
          value={summary?.pendingOrders ?? '—'}
          color="var(--am)"
        />
        <StatCard
          icon={<Users size={20} />}
          label="Clientes"
          value={summary?.totalCustomers ?? '—'}
          color="var(--vd-v)"
        />
        <StatCard
          icon={<DollarSign size={20} />}
          label="Receita"
          value={summary ? formatBRL(summary.totalRevenue) : '—'}
          color="var(--am)"
          small
        />
      </div>

      {pendingOrders.length > 0 && (
        <div>
          <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--t2)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
            Fila de pedidos ({pendingOrders.length})
          </h2>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingOrders.slice(0, 10).map((order) => (
              <li key={order.id} style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: '12px 14px', border: '1px solid var(--c3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '0.875rem' }}>#{order.orderNumber}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>{order.deliveryZoneName ?? '—'}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--am)', fontSize: '0.875rem' }}>{formatBRL(getOrderTotal(order))}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!isLoading && !summary && (
        <p style={{ color: 'var(--t2)', textAlign: 'center', marginTop: 40 }}>Dados do dashboard indisponíveis</p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color, small = false }: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  small?: boolean;
}) {
  return (
    <div style={{ background: 'var(--card)', borderRadius: 'var(--r-md)', padding: 14, border: '1px solid var(--c3)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color }}>
        {icon}
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{label}</span>
      </div>
      <p style={{ fontSize: small ? '1rem' : '1.5rem', fontWeight: 800, color: 'var(--txt)' }}>{value}</p>
    </div>
  );
}
