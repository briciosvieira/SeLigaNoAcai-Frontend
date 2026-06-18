import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, FileText, Hash, Key, Shield, Calendar, Globe } from 'lucide-react';
import type { AdminCustomer, UpdateAdminCustomerPayload, UpdateAdminCustomerPasswordPayload } from '@/types/customer.types';
import { formatPhone, formatCPF, safeText, getErrorMessage, isForbiddenError } from '@/utils/format.util';
import { formatDate } from '@/utils/date.util';

type Mode = 'view' | 'edit' | 'password';

interface Props {
  customer: AdminCustomer | null;
  isLoading: boolean;
  onClose: () => void;
  onUpdate: (id: string, payload: UpdateAdminCustomerPayload) => Promise<void>;
  onUpdateStatus: (id: string, isActive: boolean) => Promise<void>;
  onUpdatePassword: (id: string, payload: UpdateAdminCustomerPasswordPayload) => Promise<void>;
}

export function AdminCustomerDetailDrawer({
  customer, isLoading, onClose, onUpdate, onUpdateStatus, onUpdatePassword,
}: Props) {
  const isOpen = customer !== null;
  const [mode, setMode] = useState<Mode>('view');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editData, setEditData] = useState({ fullName: '', email: '', phone: '', cpf: '' });
  const [pwd, setPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');

  useEffect(() => {
    if (customer) {
      setMode('view');
      setFormError(null);
      setSuccess(null);
    }
  }, [customer?.id]);

  useEffect(() => {
    if (mode === 'edit' && customer) {
      setEditData({
        fullName: customer.fullName ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        cpf: customer.cpf ?? '',
      });
      setFormError(null);
      setSuccess(null);
    }
    if (mode === 'password') {
      setPwd('');
      setConfirmPwd('');
      setFormError(null);
      setSuccess(null);
    }
    if (mode === 'view') {
      setFormError(null);
    }
  }, [mode]);

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;
    setIsSaving(true);
    setFormError(null);
    try {
      await onUpdate(customer.id, {
        fullName: editData.fullName || undefined,
        email: editData.email || undefined,
        phone: editData.phone || undefined,
        cpf: editData.cpf || undefined,
      });
      setSuccess('Dados atualizados com sucesso.');
      setMode('view');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!customer) return;
    if (pwd.length < 6) { setFormError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (pwd !== confirmPwd) { setFormError('As senhas não coincidem.'); return; }
    setIsSaving(true);
    setFormError(null);
    try {
      await onUpdatePassword(customer.id, { password: pwd });
      setSuccess('Senha alterada com sucesso.');
      setMode('view');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleStatus() {
    if (!customer || isSaving) return;
    setIsSaving(true);
    setFormError(null);
    try {
      await onUpdateStatus(customer.id, !customer.isActive);
      setSuccess(customer.isActive ? 'Cliente desativado.' : 'Cliente ativado.');
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  const TABS: { key: Mode; label: string }[] = [
    { key: 'view', label: 'Detalhes' },
    { key: 'edit', label: 'Editar' },
    { key: 'password', label: 'Senha' },
  ];

  return (
    <>
      <div className="cd-backdrop" style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }} onClick={onClose} />

      <div className="cd-panel" style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}>
        <div className="cd-header">
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginBottom: 2 }}>Cliente</p>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {isLoading ? 'Carregando…' : safeText(customer?.fullName, 'Sem nome')}
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4, flexShrink: 0 }}>
            <X size={20} />
          </button>
        </div>

        {customer && !isLoading && (
          <div style={{ display: 'flex', borderBottom: '1px solid var(--c3)', flexShrink: 0 }}>
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setMode(t.key)}
                style={{
                  flex: 1, padding: '10px 8px', background: 'none', border: 'none',
                  borderBottom: `2px solid ${mode === t.key ? 'var(--roxo-v)' : 'transparent'}`,
                  cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                  color: mode === t.key ? 'var(--roxo-c)' : 'var(--t2)', transition: 'all 0.15s',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {isLoading && (
            <p style={{ textAlign: 'center', padding: '48px 0', color: 'var(--t2)' }}>Carregando…</p>
          )}

          {!isLoading && customer && (
            <>
              {formError && <Feedback type="err">{formError}</Feedback>}
              {success && <Feedback type="ok">{success}</Feedback>}

              {mode === 'view' && (
                <>
                  <Section title="Informações">
                    <Row icon={<User size={14} />} label="Nome" value={safeText(customer.fullName)} />
                    <Row icon={<Mail size={14} />} label="E-mail" value={safeText(customer.email)} />
                    <Row icon={<Phone size={14} />} label="Telefone" value={formatPhone(customer.phone)} />
                    <Row icon={<FileText size={14} />} label="CPF" value={formatCPF(customer.cpf)} />
                    <Row icon={<Hash size={14} />} label="Código" value={safeText(customer.customerCode)} />
                    <Row icon={<Globe size={14} />} label="Login via" value={safeText(customer.authProvider)} />
                    <Row icon={<Key size={14} />} label="Convidado" value={customer.isGuest ? 'Sim' : 'Não'} last />
                  </Section>

                  <Section title="Status">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Shield size={14} style={{ color: 'var(--t2)' }} />
                        <StatusBadge active={customer.isActive} />
                      </div>
                      <button
                        onClick={handleToggleStatus}
                        disabled={isSaving}
                        style={{
                          padding: '6px 14px', borderRadius: 'var(--r-full)', fontSize: '0.78rem', fontWeight: 700,
                          background: customer.isActive ? 'rgba(239,68,68,0.1)' : 'rgba(76,175,80,0.1)',
                          color: customer.isActive ? '#f87171' : '#4caf50',
                          border: `1px solid ${customer.isActive ? '#f8717133' : '#4caf5033'}`,
                          cursor: isSaving ? 'not-allowed' : 'pointer',
                        }}
                      >
                        {isSaving ? '…' : customer.isActive ? 'Desativar' : 'Ativar'}
                      </button>
                    </div>
                  </Section>

                  <Section title="Datas">
                    <Row icon={<Calendar size={14} />} label="Cadastro" value={formatDate(customer.createdAt)} />
                    <Row icon={<Calendar size={14} />} label="Atualização" value={formatDate(customer.updatedAt)} last />
                  </Section>
                </>
              )}

              {mode === 'edit' && (
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Nome completo">
                    <input type="text" value={editData.fullName} onChange={(e) => setEditData({ ...editData, fullName: e.target.value })} placeholder="Nome completo" className="cd-input" />
                  </Field>
                  <Field label="E-mail">
                    <input type="email" value={editData.email} onChange={(e) => setEditData({ ...editData, email: e.target.value })} placeholder="email@exemplo.com" className="cd-input" />
                  </Field>
                  <Field label="Telefone">
                    <input type="text" value={editData.phone} onChange={(e) => setEditData({ ...editData, phone: e.target.value })} placeholder="(00) 00000-0000" className="cd-input" />
                  </Field>
                  <Field label="CPF">
                    <input type="text" value={editData.cpf} onChange={(e) => setEditData({ ...editData, cpf: e.target.value })} placeholder="000.000.000-00" className="cd-input" />
                  </Field>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setMode('view')} className="cd-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="cd-btn-pri" style={{ flex: 1 }}>{isSaving ? 'Salvando…' : 'Salvar'}</button>
                  </div>
                </form>
              )}

              {mode === 'password' && (
                <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <Field label="Nova senha">
                    <input type="password" value={pwd} onChange={(e) => setPwd(e.target.value)} placeholder="Mínimo 6 caracteres" className="cd-input" />
                  </Field>
                  <Field label="Confirmar senha">
                    <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Repita a nova senha" className="cd-input" />
                  </Field>
                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    <button type="button" onClick={() => setMode('view')} className="cd-btn-sec" style={{ flex: 1 }}>Cancelar</button>
                    <button type="submit" disabled={isSaving} className="cd-btn-pri" style={{ flex: 1 }}>{isSaving ? 'Salvando…' : 'Salvar senha'}</button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      <style>{drawerStyles}</style>
    </>
  );
}

function Feedback({ type, children }: { type: 'err' | 'ok'; children: React.ReactNode }) {
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--t2)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{title}</p>
      <div style={{ background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  );
}

function Row({ icon, label, value, last }: { icon: React.ReactNode; label: string; value: string; last?: boolean }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px',
      borderBottom: last ? 'none' : '1px solid var(--c3)',
    }}>
      <span style={{ color: 'var(--t2)', flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '0.75rem', color: 'var(--t2)', width: 80, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.85rem', fontWeight: 500, wordBreak: 'break-all' }}>{value}</span>
    </div>
  );
}

function StatusBadge({ active }: { active: boolean }) {
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

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

const drawerStyles = `
  .cd-backdrop {
    position: fixed; inset: 0; background: rgba(0,0,0,0.55);
    z-index: 990; transition: opacity 0.25s;
  }
  .cd-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: 100%; max-width: 500px;
    background: var(--bg); z-index: 991; display: flex; flex-direction: column;
    transition: transform 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: -8px 0 32px rgba(0,0,0,0.35);
  }
  .cd-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    padding: 20px 20px 16px; border-bottom: 1px solid var(--c3); gap: 12px; flex-shrink: 0;
  }
  .cd-input {
    width: 100%; padding: 10px 14px; border-radius: var(--r-md);
    border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
    font-size: 0.875rem; transition: border-color 0.15s; box-sizing: border-box;
  }
  .cd-input:focus { outline: none; border-color: var(--roxo-v); }
  .cd-btn-pri {
    padding: 10px 18px; border-radius: var(--r-md); border: none;
    background: var(--roxo-v); color: #fff; font-weight: 700; font-size: 0.875rem;
    cursor: pointer; transition: opacity 0.15s;
  }
  .cd-btn-pri:disabled { opacity: 0.6; cursor: not-allowed; }
  .cd-btn-sec {
    padding: 10px 18px; border-radius: var(--r-md);
    border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
    font-weight: 600; font-size: 0.875rem; cursor: pointer;
  }
`;
