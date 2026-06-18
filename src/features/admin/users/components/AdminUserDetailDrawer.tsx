import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Hash, Calendar, Shield, Trash2, Globe, Key } from 'lucide-react';
import type { AdminUser, AdminPermission, UserRole, UpdateAdminUserPayload } from '@/types/admin.types';
import { adminPermissionLabels, ALL_ADMIN_PERMISSIONS } from '@/types/admin.types';
import { safeText, formatPhone, getErrorMessage, isForbiddenError } from '@/utils/format.util';
import { formatDate } from '@/utils/date.util';
import { usePermissions } from '@/hooks/usePermissions';

type Mode = 'view' | 'edit' | 'role' | 'permissions';

interface Props {
  user: AdminUser | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateAdminUserPayload) => Promise<void>;
  onUpdateRole: (id: string, role: UserRole) => Promise<void>;
  onUpdateStatus: (id: string, isActive: boolean) => Promise<void>;
  onUpdatePermissions: (id: string, permissions: AdminPermission[]) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

const ROLE_LABELS: Record<string, string> = { ADMIN: 'Admin', STAFF: 'Staff', CUSTOMER: 'Cliente' };

export function AdminUserDetailDrawer({
  user, isLoading, onClose, onUpdate, onUpdateRole, onUpdateStatus, onUpdatePermissions, onDelete,
}: Props) {
  const isOpen = user !== null;
  const { isAdmin } = usePermissions();
  const [mode, setMode] = useState<Mode>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [editData, setEditData] = useState({ fullName: '', phone: '' });
  const [selectedRole, setSelectedRole] = useState<UserRole>('STAFF');
  const [selectedPerms, setSelectedPerms] = useState<AdminPermission[]>([]);

  useEffect(() => {
    if (user) {
      setMode('view');
      setFormError(null);
      setSuccess(null);
      setConfirmDelete(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    if (mode === 'edit') {
      setEditData({ fullName: user.fullName ?? '', phone: user.phone ?? '' });
      setFormError(null); setSuccess(null);
    }
    if (mode === 'role') {
      setSelectedRole(user.role);
      setFormError(null); setSuccess(null);
    }
    if (mode === 'permissions') {
      setSelectedPerms([...user.permissions]);
      setFormError(null); setSuccess(null);
    }
    if (mode === 'view') setFormError(null);
  }, [mode]);

  function togglePerm(p: AdminPermission) {
    setSelectedPerms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true); setFormError(null);
    try {
      await onUpdate(user.id, { fullName: editData.fullName || undefined, phone: editData.phone || undefined });
      setSuccess('Dados atualizados.'); setMode('view');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally { setIsSaving(false); }
  }

  async function handleRoleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true); setFormError(null);
    try {
      await onUpdateRole(user.id, selectedRole);
      setSuccess('Cargo alterado.'); setMode('view');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally { setIsSaving(false); }
  }

  async function handlePermissionsSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setIsSaving(true); setFormError(null);
    try {
      await onUpdatePermissions(user.id, selectedPerms);
      setSuccess('Permissões salvas.'); setMode('view');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally { setIsSaving(false); }
  }

  async function handleToggleStatus() {
    if (!user || isSaving) return;
    setIsSaving(true); setFormError(null);
    try {
      await onUpdateStatus(user.id, !user.isActive);
      setSuccess(user.isActive ? 'Usuário desativado.' : 'Usuário ativado.');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally { setIsSaving(false); }
  }

  async function handleDelete() {
    if (!user || isSaving) return;
    setIsSaving(true); setFormError(null);
    try {
      await onDelete(user.id);
      onClose();
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
      setConfirmDelete(false);
    } finally { setIsSaving(false); }
  }

  const availableTabs: { key: Mode; label: string }[] = [
    { key: 'view', label: 'Detalhes' },
    { key: 'edit', label: 'Editar' },
    ...(isAdmin ? [{ key: 'role' as Mode, label: 'Cargo' }] : []),
    ...(isAdmin && user?.role === 'STAFF' ? [{ key: 'permissions' as Mode, label: 'Permissões' }] : []),
  ];

  return (
    <>
      <div
        className="ud-backdrop"
        style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={onClose}
      />

      <div className="ud-panel" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="ud-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginBottom: 2 }}>Usuário</p>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLoading ? 'Carregando…' : safeText(user?.fullName, 'Sem nome')}
            </h2>
            {user && (
              <RoleBadge role={user.role} />
            )}
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {user && !isLoading && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--c3)', flexShrink: 0 }}>
            {availableTabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                style={{
                  flex: 1, padding: '10px 8px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${mode === t.key ? 'var(--roxo-v)' : 'transparent'}`,
                  cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                  color: mode === t.key ? 'var(--roxo-c)' : 'var(--t2)', transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {isLoading && <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando…</p>}

          {!isLoading && user && (
            <>
              {formError && <UFeedback type="err">{formError}</UFeedback>}
              {success && <UFeedback type="ok">{success}</UFeedback>}

              {/* VIEW */}
              {mode === 'view' && (
                <>
                  <USection title="Informações">
                    <URow icon={<User size={14} />} label="Nome" value={safeText(user.fullName)} />
                    <URow icon={<Mail size={14} />} label="E-mail" value={safeText(user.email)} />
                    <URow icon={<Phone size={14} />} label="Telefone" value={formatPhone(user.phone)} />
                    <URow icon={<Hash size={14} />} label="Código" value={safeText(user.customerCode)} />
                    <URow icon={<Globe size={14} />} label="Login via" value={safeText(user.authProvider)} />
                    <URow icon={<Key size={14} />} label="Convidado" value={user.isGuest ? 'Sim' : 'Não'} last />
                  </USection>

                  {user.role === 'STAFF' && user.permissions.length > 0 && (
                    <USection title="Permissões">
                      <div style={{ padding: '12px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                        {user.permissions.map((p) => (
                          <span key={p} style={{
                            fontSize: '0.72rem', fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--r-full)',
                            background: 'rgba(139,47,201,0.15)', color: 'var(--roxo-c)', border: '1px solid rgba(139,47,201,0.25)',
                          }}>
                            {adminPermissionLabels[p] ?? p}
                          </span>
                        ))}
                      </div>
                    </USection>
                  )}

                  {isAdmin && (
                    <USection title="Status">
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <Shield size={14} style={{ color: 'var(--t2)' }} />
                          <UStatusBadge active={user.isActive} />
                        </div>
                        <button
                          onClick={handleToggleStatus}
                          disabled={isSaving}
                          style={{
                            padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700,
                            background: user.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(76,175,80,0.1)',
                            color: user.isActive ? '#f87171' : '#4caf50',
                            border: `1px solid ${user.isActive ? '#f8717133' : '#4caf5033'}`,
                            cursor: isSaving ? 'not-allowed' : 'pointer',
                          }}
                        >
                          {isSaving ? '…' : user.isActive ? 'Desativar' : 'Ativar'}
                        </button>
                      </div>
                    </USection>
                  )}

                  <USection title="Datas">
                    <URow icon={<Calendar size={14} />} label="Cadastro" value={formatDate(user.createdAt)} />
                    <URow icon={<Calendar size={14} />} label="Atualização" value={formatDate(user.updatedAt)} last />
                  </USection>

                  {isAdmin && (
                    <div style={{ marginTop: 8 }}>
                      {!confirmDelete ? (
                        <button
                          onClick={() => setConfirmDelete(true)}
                          style={{
                            width: '100%', padding: '10px 16px', borderRadius: 'var(--r-md)',
                            border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.07)',
                            color: '#f87171', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                          }}
                        >
                          <Trash2 size={14} /> Remover usuário
                        </button>
                      ) : (
                        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--r-md)', padding: 14 }}>
                          <p style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 10, color: '#f87171' }}>Confirmar remoção?</p>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => setConfirmDelete(false)} className="ud-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                            <button onClick={handleDelete} disabled={isSaving} style={{ flex: 1, padding: '10px', borderRadius: 'var(--r-md)', border: 'none', background: '#ef4444', color: '#fff', fontWeight: 700, cursor: isSaving ? 'not-allowed' : 'pointer' }}>
                              {isSaving ? '…' : 'Confirmar'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {/* EDIT */}
              {mode === 'edit' && (
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <UField label="Nome completo">
                    <input type="text" value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} placeholder="Nome completo" className="ud-input" />
                  </UField>
                  <UField label="Telefone">
                    <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="(00) 00000-0000" className="ud-input" />
                  </UField>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setMode('view')} className="ud-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="ud-btn-pri" style={{ flex: 1 }}>{isSaving ? 'Salvando…' : 'Salvar'}</button>
                  </div>
                </form>
              )}

              {/* ROLE */}
              {mode === 'role' && isAdmin && (
                <form onSubmit={handleRoleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <UField label="Cargo atual">
                    <div style={{ padding: '10px 14px', background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)' }}>
                      <RoleBadge role={user.role} />
                    </div>
                  </UField>
                  <UField label="Novo cargo">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                      className="ud-input"
                    >
                      <option value="STAFF">Staff</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </UField>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setMode('view')} className="ud-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="ud-btn-pri" style={{ flex: 1 }}>{isSaving ? 'Salvando…' : 'Alterar cargo'}</button>
                  </div>
                </form>
              )}

              {/* PERMISSIONS */}
              {mode === 'permissions' && isAdmin && (
                <form onSubmit={handlePermissionsSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <p style={{ fontSize: '0.78rem', color: 'var(--t2)', marginBottom: 4 }}>
                    Selecione as permissões para este usuário Staff.
                  </p>
                  {ALL_ADMIN_PERMISSIONS.map((p) => (
                    <label key={p} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={selectedPerms.includes(p)}
                        onChange={() => togglePerm(p)}
                        style={{ accentColor: 'var(--roxo-v)', width: 16, height: 16 }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{adminPermissionLabels[p]}</span>
                    </label>
                  ))}
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setMode('view')} className="ud-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="ud-btn-pri" style={{ flex: 1 }}>{isSaving ? 'Salvando…' : 'Salvar'}</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <style>{udStyles}</style>
    </>
  );
}

function RoleBadge({ role }: { role: string }) {
  const isAdminRole = role === 'ADMIN';
  return (
    <span style={{
      display: 'inline-block', marginTop: 4, padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '0.72rem', fontWeight: 700,
      background: isAdminRole ? 'rgba(139,47,201,0.2)' : 'rgba(59,130,246,0.15)',
      color: isAdminRole ? 'var(--roxo-c)' : '#60a5fa',
      border: `1px solid ${isAdminRole ? 'rgba(139,47,201,0.35)' : 'rgba(59,130,246,0.25)'}`,
    }}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

function UStatusBadge({ active }: { active: boolean }) {
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 'var(--r-full)', fontSize: '0.75rem', fontWeight: 700,
      background: active ? 'rgba(76,175,80,0.15)' : 'rgba(239,68,68,0.15)',
      color: active ? '#4caf50' : '#f87171',
      border: `1px solid ${active ? '#4caf5033' : '#f8717133'}`,
    }}>
      {active ? 'Ativo' : 'Inativo'}
    </span>
  );
}

function USection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{title}</p>
      <div style={{ background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function URow({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderBottom: last ? 'none' : '1px solid var(--c3)' }}>
      <span style={{ color: 'var(--t2)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--t2)', width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function UFeedback({ type, children }: { type: 'err' | 'ok'; children: React.ReactNode }) {
  const err = type === 'err';
  return (
    <div style={{
      padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: '0.82rem', fontWeight: 600, marginBottom: 16,
      background: err ? 'rgba(239,68,68,0.12)' : 'rgba(76,175,80,0.12)',
      color: err ? '#f87171' : '#4caf50',
      border: `1px solid ${err ? 'rgba(239,68,68,0.25)' : 'rgba(76,175,80,0.25)'}`,
    }}>
      {children}
    </div>
  );
}

function UField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const udStyles = `
  .ud-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    z-index: 990; transition: opacity 0.25s;
  }
  .ud-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 520px;
    background: var(--bg); z-index: 991; display: flex; flex-direction: column;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -8px 0 32px rgba(0,0,0,0.35);
  }
  .ud-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--c3); gap: 12px; flex-shrink: 0;
  }
  .ud-input {
    width: 100%; padding: 10px 14px; border-radius: var(--r-md);
    border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
    font-size: 0.875rem; transition: border-color 0.15s; box-sizing: border-box;
  }
  .ud-input:focus { outline: none; border-color: var(--roxo-v); }
  .ud-btn-pri {
    padding: 10px 18px; border-radius: var(--r-md); border: none;
    background: var(--roxo-v); color: #fff; font-weight: 700; font-size: 0.875rem;
    cursor: pointer; transition: opacity 0.15s;
  }
  .ud-btn-pri:disabled { opacity: 0.6; cursor: not-allowed; }
  .ud-btn-sec {
    padding: 10px 18px; border-radius: var(--r-md);
    border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
    font-weight: 600; font-size: 0.875rem; cursor: pointer;
  }
`;
