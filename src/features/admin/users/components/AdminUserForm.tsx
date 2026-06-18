import { useState } from 'react';
import { X } from 'lucide-react';
import type { AdminPermission, CreateAdminUserPayload } from '@/types/admin.types';
import { adminPermissionLabels, ALL_ADMIN_PERMISSIONS } from '@/types/admin.types';
import { getErrorMessage, isForbiddenError } from '@/utils/format.util';

interface Props {
  onClose: () => void;
  onCreate: (payload: CreateAdminUserPayload) => Promise<void>;
}

export function AdminUserForm({ onClose, onCreate }: Props) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'STAFF' | 'ADMIN'>('STAFF');
  const [permissions, setPermissions] = useState<AdminPermission[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function togglePerm(p: AdminPermission) {
    setPermissions((prev) => prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) { setFormError('Nome é obrigatório.'); return; }
    if (!email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    if (password.length < 6) { setFormError('A senha deve ter no mínimo 6 caracteres.'); return; }
    if (password !== confirmPassword) { setFormError('As senhas não coincidem.'); return; }

    setIsSaving(true);
    try {
      await onCreate({ fullName: fullName.trim(), email: email.trim(), phone: phone.trim(), password, role, permissions });
      onClose();
    } catch (err) {
      setFormError(isForbiddenError(err) ? 'Você não tem permissão para esta ação.' : getErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div
        onClick={onClose}
        style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.65)', zIndex: 1000 }}
      />

      <div style={{
        position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: '92%', maxWidth: 520, maxHeight: '90dvh', overflowY: 'auto',
        background: 'var(--bg)', borderRadius: 'var(--r-lg)', zIndex: 1001,
        boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid var(--c3)', flexShrink: 0 }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.05rem' }}>Criar usuário</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--t2)', cursor: 'pointer', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {formError && (
            <div style={{
              padding: '10px 14px', borderRadius: 'var(--r-md)', fontSize: '0.82rem', fontWeight: 600,
              background: 'rgba(239,68,68,0.12)', color: '#f87171', border: '1px solid rgba(239,68,68,0.25)',
            }}>
              {formError}
            </div>
          )}

          <FField label="Nome completo *">
            <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex: Maria Santos" className="uf-input" required />
          </FField>

          <FField label="E-mail *">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@exemplo.com" className="uf-input" required />
          </FField>

          <FField label="Telefone">
            <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" className="uf-input" />
          </FField>

          <FField label="Cargo *">
            <div style={{ display: 'flex', gap: 10 }}>
              {(['STAFF', 'ADMIN'] as const).map((r) => (
                <label key={r} style={{
                  flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '10px 14px', borderRadius: 'var(--r-md)', cursor: 'pointer',
                  border: `2px solid ${role === r ? 'var(--roxo-v)' : 'var(--c3)'}`,
                  background: role === r ? 'rgba(139,47,201,0.1)' : 'var(--c2)',
                  fontWeight: 600, fontSize: '0.875rem',
                  color: role === r ? 'var(--roxo-c)' : 'var(--t2)',
                  transition: 'all 0.15s',
                }}>
                  <input type="radio" value={r} checked={role === r} onChange={() => setRole(r)} style={{ display: 'none' }} />
                  {r === 'STAFF' ? 'Staff' : 'Admin'}
                </label>
              ))}
            </div>
          </FField>

          <FField label="Senha *">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" className="uf-input" required />
          </FField>

          <FField label="Confirmar senha *">
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repita a senha" className="uf-input" required />
          </FField>

          {role === 'STAFF' && (
            <div>
              <p style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 8 }}>
                Permissões <span style={{ fontWeight: 400 }}>(opcional)</span>
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {ALL_ADMIN_PERMISSIONS.map((p) => (
                  <label key={p} style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
                    background: 'var(--c2)', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', cursor: 'pointer',
                  }}>
                    <input
                      type="checkbox"
                      checked={permissions.includes(p)}
                      onChange={() => togglePerm(p)}
                      style={{ accentColor: 'var(--roxo-v)', width: 15, height: 15 }}
                    />
                    <span style={{ fontSize: '0.82rem' }}>{adminPermissionLabels[p]}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 10, paddingTop: 4 }}>
            <button type="button" onClick={onClose} style={{ flex: 1, padding: '11px 18px', borderRadius: 'var(--r-md)', border: '1px solid var(--c3)', background: 'var(--c2)', color: 'var(--txt)', fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer' }}>
              Cancelar
            </button>
            <button type="submit" disabled={isSaving} style={{ flex: 1, padding: '11px 18px', borderRadius: 'var(--r-md)', border: 'none', background: 'var(--roxo-v)', color: '#fff', fontWeight: 700, fontSize: '0.875rem', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.6 : 1 }}>
              {isSaving ? 'Criando…' : 'Criar usuário'}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .uf-input {
          width: 100%; padding: 10px 14px; border-radius: var(--r-md);
          border: 1px solid var(--c3); background: var(--c2); color: var(--txt);
          font-size: 0.875rem; transition: border-color 0.15s; box-sizing: border-box;
        }
        .uf-input:focus { outline: none; border-color: var(--roxo-v); }
      `}</style>
    </>
  );
}

function FField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--t2)', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
