import { useEffect, useState, useRef } from 'react';
import { Search, Users, ChevronRight, RefreshCw } from 'lucide-react';
import { useAdminCustomers } from '@/hooks/useAdminCustomers';
import { AdminCustomerDetailDrawer } from '../components/AdminCustomerDetailDrawer';
import { formatPhone, safeText } from '@/utils/format.util';
import { formatDate } from '@/utils/date.util';
import type { AdminCustomer } from '@/types/customer.types';

type StatusFilter = 'ALL' | 'active' | 'inactive';

const STATUS_FILTERS: { label: string; value: StatusFilter }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Ativos', value: 'active' },
  { label: 'Inativos', value: 'inactive' },
];

export function AdminCustomersPage() {
  const {
    customers, selectedCustomer, isLoading, isDetailLoading, error,
    loadCustomers, searchCustomers, filterByStatus,
    openCustomerDetail, closeCustomerDetail,
    updateCustomer, updateCustomerStatus, updateCustomerPassword,
  } = useAdminCustomers();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadCustomers(); }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchCustomers(value), 400);
  }

  function handleStatusFilter(f: StatusFilter) {
    setStatusFilter(f);
    filterByStatus(f === 'ALL' ? undefined : f === 'active');
  }

  const total = customers.length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Clientes</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            {total} cliente{total !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => loadCustomers()}
          disabled={isLoading}
          style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px',
            background: 'var(--c2)', border: '1px solid var(--c3)', borderRadius: 'var(--r-md)',
            color: 'var(--t2)', cursor: isLoading ? 'not-allowed' : 'pointer', fontSize: '0.8rem', fontWeight: 600,
          }}
        >
          <RefreshCw size={14} style={isLoading ? { animation: 'spin 0.8s linear infinite' } : {}} />
          Atualizar
        </button>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome, e-mail ou telefone…"
          style={{
            width: '100%', padding: '9px 14px 9px 36px', border: '1px solid var(--c3)',
            borderRadius: 'var(--r-md)', background: 'var(--c2)', color: 'var(--txt)',
            fontSize: '0.875rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleStatusFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 600,
              background: statusFilter === f.value ? 'var(--roxo-v)' : 'var(--c2)',
              border: `1px solid ${statusFilter === f.value ? 'var(--roxo-v)' : 'var(--c3)'}`,
              color: statusFilter === f.value ? '#fff' : 'var(--t2)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)', fontSize: '0.875rem' }}>Carregando clientes…</p>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)' }}>
          <p style={{ fontWeight: 700, marginBottom: 8, color: '#f87171' }}>{error}</p>
          <button onClick={() => loadCustomers()} style={{ color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem' }}>Tentar novamente</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && customers.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.3 }}>
            <Users size={40} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum cliente encontrado</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
            {search ? `Sem resultados para "${search}".` : 'Nenhum cliente cadastrado ainda.'}
          </p>
        </div>
      )}

      {/* Cards (mobile) */}
      {!isLoading && customers.length > 0 && (
        <>
          <div className="ac-cards">
            {customers.map((c) => <CustomerCard key={c.id} customer={c} onClick={() => openCustomerDetail(c.id)} />)}
          </div>

          {/* Table (desktop) */}
          <div className="ac-table-wrap">
            <table className="ac-table">
              <thead>
                <tr>
                  <CTh>Nome</CTh>
                  <CTh>E-mail</CTh>
                  <CTh>Telefone</CTh>
                  <CTh>Código</CTh>
                  <CTh>Auth</CTh>
                  <CTh>Status</CTh>
                  <CTh>Cadastro</CTh>
                  <CTh></CTh>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id} className="ac-row" onClick={() => openCustomerDetail(c.id)}>
                    <CTd bold>{safeText(c.fullName)}</CTd>
                    <CTd muted>{safeText(c.email)}</CTd>
                    <CTd muted>{formatPhone(c.phone)}</CTd>
                    <CTd muted>{safeText(c.customerCode)}</CTd>
                    <CTd muted>{safeText(c.authProvider)}</CTd>
                    <td style={tdStyle}>
                      <span style={{
                        padding: '3px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
                        background: c.isActive ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
                        color: c.isActive ? '#4caf50' : '#f87171',
                        border: `1px solid ${c.isActive ? '#4caf5033' : '#f8717133'}`,
                      }}>
                        {c.isActive ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <CTd muted>{formatDate(c.createdAt)}</CTd>
                    <td style={tdStyle}><ChevronRight size={16} style={{ color: 'var(--t2)', opacity: 0.5 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <AdminCustomerDetailDrawer
        customer={selectedCustomer}
        isLoading={isDetailLoading}
        onClose={closeCustomerDetail}
        onUpdate={updateCustomer}
        onUpdateStatus={updateCustomerStatus}
        onUpdatePassword={updateCustomerPassword}
      />

      <style>{acStyles}</style>
    </div>
  );
}

function CustomerCard({ customer: c, onClick }: { customer: AdminCustomer; onClick: () => void }) {
  return (
    <div className="ac-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeText(c.fullName, 'Sem nome')}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeText(c.email)}
          </p>
        </div>
        <span style={{
          marginLeft: 10, flexShrink: 0, padding: '3px 10px', borderRadius: 'var(--r-full)',
          fontSize: '0.72rem', fontWeight: 700,
          background: c.isActive ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
          color: c.isActive ? '#4caf50' : '#f87171',
          border: `1px solid ${c.isActive ? '#4caf5033' : '#f8717133'}`,
        }}>
          {c.isActive ? 'Ativo' : 'Inativo'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        {c.phone && <span style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>{formatPhone(c.phone)}</span>}
        {c.customerCode && <span style={{ fontSize: '0.75rem', color: 'var(--t2)' }}>#{c.customerCode}</span>}
        <span style={{ fontSize: '0.72rem', color: 'var(--t3)' }}>Desde {formatDate(c.createdAt)}</span>
      </div>
    </div>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px', borderBottom: '1px solid var(--c3)',
  fontSize: '0.82rem', color: 'var(--txt)', verticalAlign: 'middle',
};

function CTh({ children }: { children?: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid var(--c3)', whiteSpace: 'nowrap', background: 'var(--c2)' }}>
      {children}
    </th>
  );
}

function CTd({ children, bold, muted }: { children?: React.ReactNode; bold?: boolean; muted?: boolean }) {
  return (
    <td style={{ ...tdStyle, fontWeight: bold ? 700 : 400, color: muted ? 'var(--t2)' : 'var(--txt)' }}>
      {children ?? '—'}
    </td>
  );
}

const acStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .ac-cards { display: flex; flex-direction: column; gap: 10px; }
  .ac-table-wrap { display: none; }

  .ac-card {
    background: var(--c1); border: 1px solid var(--c3);
    border-radius: var(--r-md); padding: 14px; cursor: pointer; transition: border-color 0.15s;
  }
  .ac-card:hover { border-color: var(--roxo-v); }

  @media (min-width: 1024px) {
    .ac-cards { display: none; }
    .ac-table-wrap {
      display: block; background: var(--c1);
      border: 1px solid var(--c3); border-radius: var(--r-md); overflow: hidden;
    }
    .ac-table { width: 100%; border-collapse: collapse; }
    .ac-row { cursor: pointer; transition: background 0.1s; }
    .ac-row:hover { background: var(--c2); }
  }
`;
