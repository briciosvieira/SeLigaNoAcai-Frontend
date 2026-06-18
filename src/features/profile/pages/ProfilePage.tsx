import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCustomerProfile } from '@/hooks/useCustomerProfile';
import { useAuth } from '@/hooks/useAuth';
import { formatBRL } from '@/utils/currency.util';
import { LogOut, ShieldCheck, LayoutDashboard, ChevronRight } from 'lucide-react';
import type { AdminPermission } from '@/types/admin.types';
import '@/styles/customer-profile.css';

const permissionLabels: Record<AdminPermission, string> = {
  MANAGE_DASHBOARD: 'Dashboard',
  MANAGE_ORDERS: 'Pedidos',
  MANAGE_PRODUCTS: 'Produtos',
  MANAGE_PAYMENTS: 'Pagamentos',
  MANAGE_CUSTOMERS: 'Clientes',
  MANAGE_LOYALTY: 'Fidelidade',
  MANAGE_STORE: 'Loja',
  MANAGE_DELIVERY_ZONES: 'Bairros / Taxas',
  MANAGE_UPLOADS: 'Uploads',
  MANAGE_USERS: 'Usuários',
};

export function ProfilePage() {
  const navigate = useNavigate();
  const { user: authUser, logout, isLoading: isLoggingOut } = useAuth();

  const {
    me,
    availableDeliveryZones,
    selectedDeliveryZone,
    form,
    updateFormField,
    isLoading,
    isSavingProfile,
    isSavingAddress,
    isChangingPassword,
    errorMessage,
    successMessage,
    savePersonalData,
    saveAddress,
    changePassword,
  } = useCustomerProfile();

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const isAdmin = authUser?.role === 'ADMIN';
  const isStaff = authUser?.role === 'STAFF';
  const hasAdminAccess = isAdmin || isStaff;

  async function handleChangePassword() {
    setPasswordError(null);
    if (!passwordForm.currentPassword.trim()) {
      setPasswordError('Informe a senha atual.');
      return;
    }
    if (!passwordForm.newPassword.trim()) {
      setPasswordError('Informe a nova senha.');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('A confirmação da senha não confere.');
      return;
    }
    await changePassword({
      currentPassword: passwordForm.currentPassword,
      newPassword: passwordForm.newPassword,
    });
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  }

  if (isLoading) {
    return (
      <main className="customer-profile-page">
        <p className="customer-profile-loading">Carregando perfil...</p>
      </main>
    );
  }

  const authProvider = me?.authProvider ?? null;
  const isGoogleAccount = authProvider === 'GOOGLE';

  return (
    <main className="customer-profile-page">
      <div className="customer-profile-header">
        <h1 className="customer-profile-title">Meu Perfil</h1>
        <p className="customer-profile-subtitle">
          Mantenha seus dados atualizados para agilizar seus pedidos.
        </p>
      </div>

      {/* Admin access card */}
      {hasAdminAccess && (
        <div className="customer-profile-admin-card">
          <div className="customer-profile-admin-header">
            <ShieldCheck size={18} color="var(--roxo-c)" />
            <div>
              <p style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--roxo-c)' }}>
                Administrador
              </p>
              <p style={{ fontSize: '0.72rem', color: 'var(--t2)', marginTop: 1 }}>
                {isAdmin ? 'Acesso total ao sistema' : 'Operador com permissões específicas'}
              </p>
            </div>
          </div>

          {isStaff && authUser?.permissions && authUser.permissions.length > 0 && (
            <div style={{ padding: '10px 16px 0' }}>
              <p style={{ fontSize: '0.68rem', color: 'var(--t2)', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                Permissões
              </p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, paddingBottom: 10 }}>
                {authUser.permissions.map((perm) => (
                  <span key={perm} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '3px 9px', borderRadius: 'var(--r-full)', background: 'rgba(139,47,201,0.2)', color: 'var(--roxo-c)', border: '1px solid rgba(139,47,201,0.3)' }}>
                    {permissionLabels[perm] ?? perm}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => navigate('/admin')}
            style={{ width: '100%', padding: '13px 16px', background: 'none', border: 'none', borderTop: '1px solid rgba(139,47,201,0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fff', fontWeight: 700, fontSize: '0.875rem' }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <LayoutDashboard size={16} color="var(--roxo-c)" />
              Ir para o Painel Admin
            </span>
            <ChevronRight size={16} color="var(--roxo-c)" />
          </button>
        </div>
      )}

      {/* Global feedback messages */}
      {errorMessage && (
        <p className="customer-profile-message error">{errorMessage}</p>
      )}
      {successMessage && (
        <p className="customer-profile-message success">{successMessage}</p>
      )}

      <div className="customer-profile-grid">
        {/* Dados pessoais */}
        <article className="customer-profile-card">
          <h2 className="customer-profile-card-title">Dados pessoais</h2>

          <div className="customer-profile-form-grid">
            <label className="customer-profile-field">
              <span className="customer-profile-label">Nome completo</span>
              <input
                className="customer-profile-input"
                value={form.fullName}
                onChange={(e) => updateFormField('fullName', e.target.value)}
                placeholder="Seu nome completo"
                autoComplete="name"
              />
            </label>

            <label className="customer-profile-field">
              <span className="customer-profile-label">Telefone</span>
              <input
                className="customer-profile-input"
                value={form.phone}
                onChange={(e) => updateFormField('phone', e.target.value)}
                placeholder="(00) 00000-0000"
                autoComplete="tel"
              />
            </label>
          </div>

          <div className="customer-profile-actions">
            <button
              type="button"
              className="customer-profile-button"
              onClick={() => void savePersonalData()}
              disabled={isSavingProfile}
            >
              {isSavingProfile ? 'Salvando...' : 'Salvar dados pessoais'}
            </button>
          </div>
        </article>

        {/* Endereço de entrega */}
        <article className="customer-profile-card">
          <h2 className="customer-profile-card-title">Endereço de entrega</h2>

          <div className="customer-profile-form-grid">
            <label className="customer-profile-field full">
              <span className="customer-profile-label">Bairro</span>
              <select
                className="customer-profile-select"
                value={form.deliveryZoneId}
                onChange={(e) => updateFormField('deliveryZoneId', e.target.value)}
              >
                <option value="">Selecione seu bairro</option>
                {availableDeliveryZones.map((zone) => (
                  <option key={zone.id} value={zone.id}>
                    {zone.neighborhood} — {formatBRL(zone.deliveryFee)}
                  </option>
                ))}
              </select>
            </label>

            {selectedDeliveryZone && (
              <div className="customer-profile-delivery-fee">
                <span>Taxa de entrega</span>
                <strong>{formatBRL(selectedDeliveryZone.deliveryFee)}</strong>
              </div>
            )}

            <label className="customer-profile-field" style={{ gridColumn: 'span 1' }}>
              <span className="customer-profile-label">Rua / Avenida</span>
              <input
                className="customer-profile-input"
                value={form.street}
                onChange={(e) => updateFormField('street', e.target.value)}
                placeholder="Nome da rua ou avenida"
                autoComplete="street-address"
              />
            </label>

            <label className="customer-profile-field" style={{ gridColumn: 'span 1' }}>
              <span className="customer-profile-label">Número</span>
              <input
                className="customer-profile-input"
                value={form.number}
                onChange={(e) => updateFormField('number', e.target.value)}
                placeholder="Nº"
              />
            </label>

            <label className="customer-profile-field full">
              <span className="customer-profile-label">Complemento</span>
              <input
                className="customer-profile-input"
                value={form.complement}
                onChange={(e) => updateFormField('complement', e.target.value)}
                placeholder="Apto, bloco, casa... (opcional)"
              />
            </label>

            <label className="customer-profile-field full">
              <span className="customer-profile-label">Ponto de referência</span>
              <input
                className="customer-profile-input"
                value={form.referencePoint}
                onChange={(e) => updateFormField('referencePoint', e.target.value)}
                placeholder="Ex: próximo ao mercado (opcional)"
              />
            </label>
          </div>

          <div className="customer-profile-actions">
            <button
              type="button"
              className="customer-profile-button"
              onClick={() => void saveAddress()}
              disabled={isSavingAddress}
            >
              {isSavingAddress ? 'Salvando...' : 'Salvar endereço'}
            </button>
          </div>
        </article>

        {/* Segurança da conta */}
        <article className="customer-profile-card">
          <h2 className="customer-profile-card-title">Segurança da conta</h2>

          {isGoogleAccount ? (
            <p className="customer-profile-info">
              Sua conta utiliza login com Google. A senha é gerenciada pelo Google.
            </p>
          ) : (
            <>
              {passwordError && (
                <p className="customer-profile-message error">{passwordError}</p>
              )}

              <div className="customer-profile-form-grid">
                <label className="customer-profile-field full">
                  <span className="customer-profile-label">Senha atual</span>
                  <input
                    className="customer-profile-input"
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))
                    }
                    autoComplete="current-password"
                  />
                </label>

                <label className="customer-profile-field">
                  <span className="customer-profile-label">Nova senha</span>
                  <input
                    className="customer-profile-input"
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                </label>

                <label className="customer-profile-field">
                  <span className="customer-profile-label">Confirmar nova senha</span>
                  <input
                    className="customer-profile-input"
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
                    }
                    autoComplete="new-password"
                  />
                </label>
              </div>

              <div className="customer-profile-actions">
                <button
                  type="button"
                  className="customer-profile-button"
                  onClick={() => void handleChangePassword()}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? 'Alterando...' : 'Alterar senha'}
                </button>
              </div>
            </>
          )}
        </article>
      </div>

      {/* Logout */}
      <button
        type="button"
        className="customer-profile-logout-button"
        onClick={() => void logout()}
        disabled={isLoggingOut}
      >
        <LogOut size={16} />
        {isLoggingOut ? 'Saindo...' : 'Sair da conta'}
      </button>
    </main>
  );
}
