import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import {
  getPasswordRecoverySettingsRequest,
  sendPasswordRecoveryTestEmailRequest,
  updatePasswordRecoverySettingsRequest,
} from '@/services/admin-password-recovery.service';
import type { PasswordRecoverySettings } from '@/services/admin-password-recovery.service';

const DEFAULT_BODY = `Olá {nome},

Sua nova senha temporária é:

{senha}

Acesse sua conta e altere sua senha após entrar.

Se você não solicitou essa recuperação, entre em contato com o Se Liga no Açaí.`;

const defaultSettings: PasswordRecoverySettings = {
  senderName: 'Se Liga no Açaí',
  replyToEmail: '',
  subject: 'Recuperação de senha - Se Liga no Açaí',
  bodyTemplate: DEFAULT_BODY,
  isActive: true,
};

export function AdminPasswordRecoveryPage() {
  const [form, setForm] = useState<PasswordRecoverySettings>(defaultSettings);
  const [testEmail, setTestEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void loadSettings();
  }, []);

  async function loadSettings() {
    try {
      setIsLoading(true);
      const data = await getPasswordRecoverySettingsRequest();
      if (data) setForm({ ...defaultSettings, ...data });
    } catch {
      // sem configuração salva ainda — usa defaults
    } finally {
      setIsLoading(false);
    }
  }

  function setField<K extends keyof PasswordRecoverySettings>(key: K, value: PasswordRecoverySettings[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setMessage(null);
    setError(null);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setMessage(null);
    setError(null);

    if (!form.bodyTemplate.includes('{senha}')) {
      setError('O texto do e-mail precisa conter a variável {senha}.');
      return;
    }

    try {
      setIsSaving(true);
      const data = await updatePasswordRecoverySettingsRequest(form);
      if (data) setForm({ ...defaultSettings, ...data });
      setMessage('Configuração salva com sucesso.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Não foi possível salvar as configurações.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleSendTest() {
    if (!testEmail.trim()) {
      setError('Informe um e-mail para o teste.');
      return;
    }
    setMessage(null);
    setError(null);

    try {
      setIsTesting(true);
      await sendPasswordRecoveryTestEmailRequest(testEmail.trim());
      setMessage('E-mail de teste enviado com sucesso.');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } } };
      setError(e?.response?.data?.message ?? 'Não foi possível enviar o e-mail de teste.');
    } finally {
      setIsTesting(false);
    }
  }

  if (isLoading) {
    return (
      <div style={{ padding: 32, color: 'var(--t2)', fontSize: '0.9rem' }}>
        Carregando configurações…
      </div>
    );
  }

  return (
    <>
      <div className="apr-page">
        <header className="apr-header">
          <h1>Recuperação de senha</h1>
          <p>Configure o e-mail enviado quando um cliente solicitar recuperação de senha.</p>
        </header>

        {message && <div className="apr-alert apr-alert--success">{message}</div>}
        {error && <div className="apr-alert apr-alert--error">{error}</div>}

        <form className="apr-card" onSubmit={handleSubmit}>
          <h2 className="apr-card-title">Configuração do e-mail</h2>

          <label className="apr-label">
            Nome do remetente
            <input
              className="apr-input"
              value={form.senderName}
              onChange={(e) => setField('senderName', e.target.value)}
              placeholder="Se Liga no Açaí"
              required
            />
          </label>

          <label className="apr-label">
            E-mail de resposta (reply-to)
            <input
              className="apr-input"
              type="email"
              value={form.replyToEmail ?? ''}
              onChange={(e) => setField('replyToEmail', e.target.value)}
              placeholder="contato@seliganoacai.com.br"
            />
          </label>

          <label className="apr-label">
            Assunto do e-mail
            <input
              className="apr-input"
              value={form.subject}
              onChange={(e) => setField('subject', e.target.value)}
              placeholder="Recuperação de senha - Se Liga no Açaí"
              required
            />
          </label>

          <label className="apr-label">
            Texto do e-mail
            <textarea
              className="apr-textarea"
              rows={10}
              value={form.bodyTemplate}
              onChange={(e) => setField('bodyTemplate', e.target.value)}
              required
            />
          </label>

          <div className="apr-vars-help">
            Variáveis disponíveis:{' '}
            <code>{'{nome}'}</code> — nome do cliente &nbsp;|&nbsp;
            <code>{'{senha}'}</code> — senha temporária &nbsp;|&nbsp;
            <code>{'{email}'}</code> — e-mail do cliente
          </div>

          <label className="apr-toggle">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setField('isActive', e.target.checked)}
            />
            Recuperação de senha ativa
          </label>

          <button type="submit" className="apr-btn apr-btn--primary" disabled={isSaving}>
            {isSaving ? 'Salvando…' : 'Salvar configuração'}
          </button>
        </form>

        <section className="apr-card">
          <h2 className="apr-card-title">Enviar e-mail de teste</h2>
          <p className="apr-card-desc">
            Envia um e-mail usando as configurações atuais (salvas no servidor) para verificar se está funcionando.
          </p>

          <label className="apr-label">
            E-mail para teste
            <input
              className="apr-input"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              placeholder="teste@gmail.com"
            />
          </label>

          <button
            type="button"
            className="apr-btn apr-btn--secondary"
            onClick={handleSendTest}
            disabled={isTesting}
          >
            {isTesting ? 'Enviando…' : 'Enviar e-mail de teste'}
          </button>
        </section>
      </div>

      <style>{aprStyles}</style>
    </>
  );
}

const aprStyles = `
  .apr-page {
    display: flex;
    flex-direction: column;
    gap: 20px;
    max-width: 720px;
  }

  .apr-header h1 {
    margin: 0 0 6px;
    font-size: 1.6rem;
    font-weight: 800;
    color: var(--txt, #fff);
  }

  .apr-header p {
    margin: 0;
    color: var(--t2, rgba(255,255,255,0.6));
    font-size: 0.9rem;
  }

  .apr-alert {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .apr-alert--success {
    color: #86efac;
    background: rgba(34, 197, 94, 0.13);
    border: 1px solid rgba(34, 197, 94, 0.25);
  }

  .apr-alert--error {
    color: #fca5a5;
    background: rgba(239, 68, 68, 0.13);
    border: 1px solid rgba(239, 68, 68, 0.25);
  }

  .apr-card {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 20px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.09);
  }

  .apr-card-title {
    margin: 0;
    font-size: 1rem;
    font-weight: 700;
    color: var(--txt, #fff);
  }

  .apr-card-desc {
    margin: 0;
    font-size: 0.85rem;
    color: var(--t2, rgba(255,255,255,0.55));
    line-height: 1.5;
  }

  .apr-label {
    display: flex;
    flex-direction: column;
    gap: 6px;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--t2, rgba(255,255,255,0.55));
  }

  .apr-input,
  .apr-textarea {
    width: 100%;
    padding: 10px 14px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.11);
    border-radius: 10px;
    color: var(--txt, #fff);
    font-size: 0.9rem;
    outline: none;
    box-sizing: border-box;
    transition: border-color 0.2s;
    font-family: inherit;
  }

  .apr-input:focus,
  .apr-textarea:focus {
    border-color: rgba(139, 92, 246, 0.5);
  }

  .apr-textarea {
    resize: vertical;
    min-height: 180px;
    line-height: 1.6;
  }

  .apr-vars-help {
    padding: 10px 14px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    color: var(--t2, rgba(255,255,255,0.6));
    font-size: 0.82rem;
    line-height: 1.6;
  }

  .apr-vars-help code {
    color: var(--roxo-c, #a78bfa);
    font-size: 0.85rem;
  }

  .apr-toggle {
    display: flex;
    flex-direction: row !important;
    align-items: center;
    gap: 10px;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--txt, #fff);
    cursor: pointer;
  }

  .apr-toggle input {
    width: auto;
    accent-color: var(--roxo-v, #7c3aed);
    cursor: pointer;
  }

  .apr-btn {
    min-height: 44px;
    padding: 0 20px;
    border: 0;
    border-radius: 12px;
    font-weight: 700;
    font-size: 0.9rem;
    cursor: pointer;
    transition: opacity 0.15s;
    align-self: flex-start;
  }

  .apr-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .apr-btn--primary {
    background: var(--roxo-v, #7c3aed);
    color: #fff;
  }

  .apr-btn--secondary {
    background: rgba(255, 255, 255, 0.1);
    color: var(--txt, #fff);
    border: 1px solid rgba(255, 255, 255, 0.15);
  }
`;
