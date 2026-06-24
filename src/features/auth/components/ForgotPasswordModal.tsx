import { FormEvent, useState } from 'react';
import { requestCustomerPasswordRecovery } from '@/services/auth.service';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export function ForgotPasswordModal({ isOpen, onClose }: Props) {
  const [email, setEmail] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setIsSending(true);
    setMessage(null);
    setError(null);

    try {
      await requestCustomerPasswordRecovery(email.trim());
      setMessage('Se o e-mail estiver cadastrado, enviaremos uma nova senha temporária em breve.');
      setEmail('');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; error?: string } } };
      const msg =
        e?.response?.data?.message ??
        e?.response?.data?.error ??
        'Não foi possível solicitar a recuperação agora. Tente novamente em instantes.';
      setError(msg);
    } finally {
      setIsSending(false);
    }
  }

  function handleOverlayMouseDown() {
    onClose();
  }

  return (
    <>
      <div className="forgot-modal-overlay" onMouseDown={handleOverlayMouseDown}>
        <div className="forgot-modal-card" onMouseDown={(e) => e.stopPropagation()}>
          <button type="button" className="forgot-modal-close" onClick={onClose} aria-label="Fechar">
            ×
          </button>

          <h2 className="forgot-modal-title">Recuperar senha</h2>
          <p className="forgot-modal-desc">
            Informe seu e-mail cadastrado. Se ele existir, enviaremos uma nova senha temporária.
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <label className="forgot-modal-label">E-mail</label>
              <input
                type="email"
                className="forgot-modal-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@gmail.com"
                required
                autoFocus
              />
            </div>

            <button type="submit" className="forgot-modal-submit" disabled={isSending}>
              {isSending ? 'Enviando…' : 'Enviar nova senha'}
            </button>
          </form>

          {message && <div className="forgot-modal-alert forgot-modal-alert--success">{message}</div>}
          {error && <div className="forgot-modal-alert forgot-modal-alert--error">{error}</div>}
        </div>
      </div>

      <style>{forgotModalStyles}</style>
    </>
  );
}

const forgotModalStyles = `
  .forgot-modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 1200;
    display: grid;
    place-items: center;
    padding: 18px;
    background: rgba(0, 0, 0, 0.78);
  }

  .forgot-modal-card {
    position: relative;
    width: min(420px, 100%);
    border-radius: 22px;
    padding: 28px 24px 24px;
    background: #151515;
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(0, 0, 0, 0.5);
  }

  .forgot-modal-close {
    position: absolute;
    top: 10px;
    right: 14px;
    border: 0;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font-size: 28px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }

  .forgot-modal-close:hover {
    color: #ffffff;
  }

  .forgot-modal-title {
    margin: 0 0 8px;
    font-size: 1.35rem;
    font-weight: 800;
  }

  .forgot-modal-desc {
    margin: 0 0 18px;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.875rem;
    line-height: 1.55;
  }

  .forgot-modal-label {
    display: block;
    margin-bottom: 5px;
    font-size: 0.82rem;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 600;
  }

  .forgot-modal-input {
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

  .forgot-modal-input:focus {
    border-color: rgba(134, 239, 172, 0.5);
  }

  .forgot-modal-submit {
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

  .forgot-modal-submit:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }

  .forgot-modal-alert {
    margin-top: 14px;
    padding: 12px 14px;
    border-radius: var(--r-md, 10px);
    font-size: 0.82rem;
    font-weight: 600;
    line-height: 1.5;
  }

  .forgot-modal-alert--success {
    color: #86efac;
    background: rgba(34, 197, 94, 0.13);
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .forgot-modal-alert--error {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.13);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }
`;
