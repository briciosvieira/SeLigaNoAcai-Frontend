import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { changeMyPasswordRequest } from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';

export function ForceChangePasswordPage() {
  const navigate = useNavigate();
  const updateUser = useAuthStore((s) => s.updateUser);
  const user = useAuthStore((s) => s.user);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação não confere com a nova senha.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('A nova senha não pode ser igual à senha temporária.');
      return;
    }

    setIsSaving(true);
    try {
      await changeMyPasswordRequest({ currentPassword, newPassword });
      updateUser({ mustChangePassword: false });
      setSuccess(true);
      setTimeout(() => navigate('/', { replace: true }), 1500);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      setError(
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        'Não foi possível alterar a senha. Verifique a senha atual e tente novamente.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <div className="fcp-root">
        <div className="fcp-card">
          <div className="fcp-icon">🔑</div>
          <h1 className="fcp-title">Altere sua senha</h1>
          <p className="fcp-desc">
            Olá{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''}! Você recebeu uma senha temporária.
            Para continuar, crie uma nova senha pessoal.
          </p>

          {success ? (
            <div className="fcp-alert fcp-alert--success">
              Senha alterada com sucesso! Redirecionando…
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="fcp-form">
              <div>
                <label className="fcp-label">Senha temporária (atual)</label>
                <input
                  type="password"
                  className="fcp-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Senha recebida por e-mail"
                  autoComplete="current-password"
                  required
                />
              </div>

              <div>
                <label className="fcp-label">Nova senha</label>
                <input
                  type="password"
                  className="fcp-input"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                  required
                />
              </div>

              <div>
                <label className="fcp-label">Confirmar nova senha</label>
                <input
                  type="password"
                  className="fcp-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repita a nova senha"
                  autoComplete="new-password"
                  required
                />
              </div>

              {error && (
                <div className="fcp-alert fcp-alert--error">{error}</div>
              )}

              <button type="submit" className="fcp-submit" disabled={isSaving}>
                {isSaving ? 'Salvando…' : 'Salvar nova senha'}
              </button>
            </form>
          )}
        </div>
      </div>

      <style>{fcpStyles}</style>
    </>
  );
}

const fcpStyles = `
  .fcp-root {
    min-height: 100dvh;
    display: grid;
    place-items: center;
    padding: 20px;
    background: linear-gradient(160deg, #0d0507 0%, #130524 50%, #0d0d0d 100%);
  }

  .fcp-card {
    width: min(440px, 100%);
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 22px;
    padding: 32px 28px;
    color: #ffffff;
  }

  .fcp-icon {
    font-size: 2rem;
    margin-bottom: 14px;
  }

  .fcp-title {
    margin: 0 0 8px;
    font-size: 1.5rem;
    font-weight: 800;
  }

  .fcp-desc {
    margin: 0 0 24px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    line-height: 1.55;
  }

  .fcp-form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .fcp-label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 600;
  }

  .fcp-input {
    width: 100%;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: var(--r-md, 10px);
    color: #ffffff;
    font-size: 0.95rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
  }

  .fcp-input:focus {
    border-color: rgba(134, 239, 172, 0.5);
  }

  .fcp-submit {
    width: 100%;
    padding: 13px;
    margin-top: 4px;
    border: 0;
    border-radius: var(--r-md, 10px);
    background: linear-gradient(135deg, #22c55e, #16a34a);
    color: #ffffff;
    font-weight: 700;
    font-size: 1rem;
    cursor: pointer;
    transition: opacity 0.15s;
  }

  .fcp-submit:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .fcp-alert {
    padding: 12px 14px;
    border-radius: var(--r-md, 10px);
    font-size: 0.85rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .fcp-alert--success {
    color: #86efac;
    background: rgba(34, 197, 94, 0.13);
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .fcp-alert--error {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.13);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
`;
