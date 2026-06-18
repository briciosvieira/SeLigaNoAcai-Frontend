import { useEffect, useState, useRef } from 'react';
import { Search, UserCog, ChevronRight, RefreshCw, Plus } from 'lucide-react';
import { useAdminUsers } from '@/hooks/useAdminUsers';
import { usePermissions } from '@/hooks/usePermissions';
import { AdminUserDetailDrawer } from '../components/AdminUserDetailDrawer';
import { AdminUserForm } from '../components/AdminUserForm';
import { safeText, formatPhone } from '@/utils/format.util';
import { formatDate } from '@/utils/date.util';
import { adminPermissionLabels } from '@/types/admin.types';
import type { AdminUser } from '@/types/admin.types';

type RoleFilter = 'ALL' | 'ADMIN' | 'STAFF';

const ROLE_FILTERS: { label: string; value: RoleFilter }[] = [
  { label: 'Todos', value: 'ALL' },
  { label: 'Admin', value: 'ADMIN' },
  { label: 'Staff', value: 'STAFF' },
];

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Staff', CUSTOMER: 'Cliente' };

export function AdminUsersPage() {
  const {
    users, selectedUser, isLoading, isDetailLoading, error,
    loadUsers, searchUsers, filterByRole,
    openUserDetail, closeUserDetail,
    createUser, updateUser, updateUserRole, updateUserStatus, updateUserPermissions, deleteUser,
  } = useAdminUsers();

  const { isAdmin } = usePermissions();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('ALL');
  const [showForm, setShowForm] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { loadUsers(); }, []);

  function handleSearch(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(value), 400);
  }

  function handleRoleFilter(f: RoleFilter) {
    setRoleFilter(f);
    filterByRole(f === 'ALL' ? undefined : f);
  }

  const total = users.length;

  return (
    <div style={{ position: 'relative' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16, flexWrap: 'wrap', gap: 8 }}>
        <div>
          <h1 style={{ fontSize: '1.35rem', fontWeight: 800 }}>Usuários</h1>
          <p style={{ fontSize: '0.8rem', color: 'var(--t2)', marginTop: 2 }}>
            {total} usuário{total !== 1 ? 's' : ''}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => loadUsers()}
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
          {isAdmin && (
            <button
              onClick={() => setShowForm(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                background: 'var(--roxo-v)', border: 'none', borderRadius: 'var(--r-md)',
                color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700,
              }}
            >
              <Plus size={15} /> Novo usuário
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: 12 }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--t2)' }} />
        <input
          type="text"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar por nome ou e-mail…"
          style={{
            width: '100%', padding: '9px 14px 9px 36px', border: '1px solid var(--c3)',
            borderRadius: 'var(--r-md)', background: 'var(--c2)', color: 'var(--txt)',
            fontSize: '0.875rem', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Role filter */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleRoleFilter(f.value)}
            style={{
              padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 600,
              background: roleFilter === f.value ? 'var(--roxo-v)' : 'var(--c2)',
              border: `1px solid ${roleFilter === f.value ? 'var(--roxo-v)' : 'var(--c3)'}`,
              color: roleFilter === f.value ? '#fff' : 'var(--t2)',
              cursor: 'pointer',
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)', fontSize: '0.875rem' }}>Carregando usuários…</p>
      )}

      {/* Error */}
      {!isLoading && error && (
        <div style={{ textAlign: 'center', padding: '40px 24px', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)' }}>
          <p style={{ fontWeight: 700, marginBottom: 8, color: '#f87171' }}>{error}</p>
          <button onClick={() => loadUsers()} style={{ color: 'var(--roxo-c)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Tentar novamente</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--c3)', borderRadius: 'var(--r-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12, opacity: 0.3 }}>
            <UserCog size={40} />
          </div>
          <p style={{ fontWeight: 700, marginBottom: 4 }}>Nenhum usuário encontrado</p>
          <p style={{ fontSize: '0.82rem', color: 'var(--t2)' }}>
            {search ? `Sem resultados para "${search}".` : 'Nenhum usuário admin/staff cadastrado.'}
          </p>
        </div>
      )}

      {/* Cards (mobile) */}
      {!isLoading && users.length > 0 && (
        <>
          <div className="au-cards">
            {users.map((u) => <UserCard key={u.id} user={u} onClick={() => openUserDetail(u.id)} />)}
          </div>

          {/* Table (desktop) */}
          <div className="au-table-wrap">
            <table className="au-table">
              <thead>
                <tr>
                  <UTh>Nome</UTh>
                  <UTh>E-mail</UTh>
                  <UTh>Telefone</UTh>
                  <UTh>Cargo</UTh>
                  <UTh>Permissões</UTh>
                  <UTh>Status</UTh>
                  <UTh>Cadastro</UTh>
                  <UTh></UTh>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="au-row" onClick={() => openUserDetail(u.id)}>
                    <UTd bold>{safeText(u.fullName)}</UTd>
                    <UTd muted>{safeText(u.email)}</UTd>
                    <UTd muted>{formatPhone(u.phone)}</UTd>
                    <td style={tdStyle}>
                      <RoleChip role={u.role} />
                    </td>
                    <td style={tdStyle}>
                      {u.role === 'STAFF' && u.permissions.length > 0 ? (
                        <span style={{ fontSize: '0.72rem', color: 'var(--t2)' }}>
                          {u.permissions.length === 1
                            ? adminPermissionLabels[u.permissions[0]] ?? u.permissions[0]
                            : `${u.permissions.length} permissões`}
                        </span>
                      ) : <span style={{ color: 'var(--t3)', fontSize: '0.75rem' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <StatusChip active={u.isActive} />
                    </td>
                    <UTd muted>{formatDate(u.createdAt)}</UTd>
                    <td style={tdStyle}><ChevronRight size={16} style={{ color: 'var(--t2)', opacity: 0.5 }} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Drawers / Modals */}
      <AdminUserDetailDrawer
        user={selectedUser}
        isLoading={isDetailLoading}
        onClose={closeUserDetail}
        onUpdate={updateUser}
        onUpdateRole={updateUserRole}
        onUpdateStatus={updateUserStatus}
        onUpdatePermissions={updateUserPermissions}
        onDelete={deleteUser}
      />

      {showForm && (
        <AdminUserForm
          onClose={() => setShowForm(false)}
          onCreate={async (payload) => { await createUser(payload); setShowForm(false); }}
        />
      )}

      <style>{auStyles}</style>
    </div>
  );
}

function UserCard({ user: u, onClick }: { user: AdminUser; onClick: () => void }) {
  return (
    <div className="au-card" onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeText(u.fullName, 'Sem nome')}
          </p>
          <p style={{ fontSize: '0.75rem', color: 'var(--t2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {safeText(u.email)}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 10 }}>
          <RoleChip role={u.role} />
          <StatusChip active={u.isActive} />
        </div>
      </div>
      {u.role === 'STAFF' && u.permissions.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginTop: 6 }}>
          {u.permissions.slice(0, 3).map((p) => (
            <span key={p} style={{ fontSize: '0.68rem', padding: '2px 7px', background: 'rgba(139,47,201,0.12)', color: 'var(--roxo-c)', borderRadius: 'var(--r-full)', border: '1px solid rgba(139,47,201,0.2)' }}>
              {adminPermissionLabels[p] ?? p}
            </span>
          ))}
          {u.permissions.length > 3 && (
            <span style={{ fontSize: '0.68rem', color: 'var(--t2)', padding: '2px 6px' }}>+{u.permissions.length - 3}</span>
          )}
        </div>
      )}
    </div>
  );
}

function RoleChip({ role }: { role: string }) {
  const isAdminRole = role === 'ADMIN';
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
      background: isAdminRole ? 'rgba(139,47,201,0.18)' : 'rgba(59,130,246,0.15)',
      color: isAdminRole ? 'var(--roxo-c)' : '#60a5fa',
      border: `1px solid ${isAdminRole ? 'rgba(139,47,201,0.3)' : 'rgba(59,130,246,0.25)'}`,
    }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function StatusChip({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '2px 9px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#4caf50' : '#f87171',
      border: `1px solid ${active ? '#4caf5033' : '#f8717133'}`,
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

const tdStyle: React.CSSProperties = {
  padding: '12px 14px', borderBottom: '1px solid var(--c3)',
  fontSize: '0.82rem', color: 'var(--txt)', verticalAlign: 'middle',
};

function UTh({ children }: { children?: React.ReactNode }) {
  return (
    <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '2px solid var(--c3)', whiteSpace: 'nowrap', background: 'var(--c2)' }}>
      {children}
    </th>
  );
}

function UTd({ children, bold, muted }: { children?: React.ReactNode; bold?: boolean; muted?: boolean }) {
  return (
    <td style={{ ...tdStyle, fontWeight: bold ? 700 : 400, color: muted ? 'var(--t2)' : 'var(--txt)' }}>
      {children ?? '—'}
    </td>
  );
}

const auStyles = `
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

  .au-cards { display: flex; flex-direction: column; gap: 10px; }
  .au-table-wrap { display: none; }

  .au-card {
    background: var(--c1); border: 1px solid var(--c3);
    border-radius: var(--r-md); padding: 14px; cursor: pointer; transition: border-color 0.15s;
  }
  .au-card:hover { border-color: var(--roxo-v); }

  @media (min-width: 1024px) {
    .au-cards { display: none; }
    .au-table-wrap {
      display: block; background: var(--c1);
      border: 1px solid var(--c3); border-radius: var(--r-md); overflow: hidden;
    }
    .au-table { width: 100%; border-collapse: collapse; }
    .au-row { cursor: pointer; transition: background 0.1s; }
    .au-row:hover { background: var(--c2); }
  }
`;
