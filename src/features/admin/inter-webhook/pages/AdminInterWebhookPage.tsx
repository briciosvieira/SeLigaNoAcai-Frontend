import { useEffect } from 'react';
import { RefreshCw, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAdminInterWebhook } from '@/hooks/useAdminInterWebhook';
import { formatDateTime } from '@/utils/date.util';
import '../admin-inter-webhook.css';

export function AdminInterWebhookPage() {
  const {
    webhook,
    lastChecked,
    loading,
    validating,
    registering,
    error,
    successMessage,
    loadWebhook,
    validateWebhook,
    registerWebhook,
  } = useAdminInterWebhook();

  useEffect(() => {
    void loadWebhook();
  }, [loadWebhook]);

  const expectedUrl =
    (webhook?.expectedWebhookUrl as string | null | undefined) ??
    'URL não informada pelo backend';

  const registeredUrl =
    (webhook?.registeredWebhookUrl as string | null | undefined) ??
    (webhook?.webhookUrl as string | null | undefined) ??
    (webhook?.url as string | null | undefined) ??
    null;

  const isRegistered =
    Boolean(expectedUrl && registeredUrl) &&
    expectedUrl !== 'URL não informada pelo backend' &&
    expectedUrl === registeredUrl;

  const isAnythingLoading = loading || validating || registering;

  function getStatusLabel(): string {
    if (!registeredUrl) return 'Não cadastrado';
    if (isRegistered) return 'Cadastrado corretamente';
    return 'URL divergente';
  }

  function getStatusClass(): string {
    if (!registeredUrl) return 'is-empty';
    if (isRegistered) return 'is-ok';
    return 'is-mismatch';
  }

  return (
    <div className="admin-inter-webhook-page">
      <div className="admin-inter-webhook-header">
        <h1>Integração PIX Inter</h1>
        <p>
          Gerencie a URL de webhook usada pelo Banco Inter para confirmar pagamentos PIX
          automaticamente. A URL esperada é definida pelo backend via variável de ambiente.
        </p>
      </div>

      {error && (
        <div className="admin-inter-webhook-alert error">
          <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {error}
        </div>
      )}

      {successMessage && (
        <div className="admin-inter-webhook-alert success">
          <CheckCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
          {successMessage}
        </div>
      )}

      <div className="admin-inter-webhook-grid">
        {/* Status card */}
        <div className="admin-inter-webhook-card">
          <h2>Status atual</h2>

          {loading ? (
            <div className="admin-inter-webhook-loading">
              <RefreshCw size={18} className="admin-inter-spin" />
              Consultando webhook…
            </div>
          ) : (
            <div className="admin-inter-webhook-status">
              <div className="admin-inter-webhook-row">
                <span>URL pública esperada</span>
                {expectedUrl === 'URL não informada pelo backend' ? (
                  <strong className="muted">{expectedUrl}</strong>
                ) : (
                  <strong className="breakable expected">{expectedUrl}</strong>
                )}
              </div>

              <div className="admin-inter-webhook-row">
                <span>URL cadastrada no Inter</span>
                {registeredUrl ? (
                  <strong className={`breakable${isRegistered ? ' ok' : ' mismatch'}`}>
                    {registeredUrl}
                  </strong>
                ) : (
                  <strong className="muted">
                    {webhook !== null ? 'Nenhum webhook cadastrado encontrado.' : 'Ainda não consultado.'}
                  </strong>
                )}
              </div>

              <div className="admin-inter-webhook-row">
                <span>Status</span>
                <span className={`admin-inter-webhook-badge ${getStatusClass()}`}>
                  {getStatusLabel()}
                </span>
              </div>

              {lastChecked && (
                <div className="admin-inter-webhook-row">
                  <span>Última consulta</span>
                  <strong>{formatDateTime(lastChecked.toISOString())}</strong>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions card */}
        <div className="admin-inter-webhook-card">
          <h2>Ações</h2>

          <div className="admin-inter-webhook-actions">
            <button
              type="button"
              className="admin-inter-webhook-button secondary"
              onClick={loadWebhook}
              disabled={isAnythingLoading}
            >
              {loading ? (
                <RefreshCw size={15} className="admin-inter-spin" />
              ) : (
                <RefreshCw size={15} />
              )}
              {loading ? 'Consultando…' : 'Consultar webhook'}
            </button>

            <button
              type="button"
              className="admin-inter-webhook-button secondary"
              onClick={validateWebhook}
              disabled={isAnythingLoading}
            >
              {validating ? (
                <RefreshCw size={15} className="admin-inter-spin" />
              ) : (
                <Zap size={15} />
              )}
              {validating ? 'Validando…' : 'Validar URL no Inter'}
            </button>

            <button
              type="button"
              className="admin-inter-webhook-button"
              onClick={registerWebhook}
              disabled={isAnythingLoading}
            >
              {registering ? (
                <RefreshCw size={15} className="admin-inter-spin" />
              ) : (
                <Zap size={15} />
              )}
              {registering ? 'Registrando…' : 'Registrar / Atualizar webhook'}
            </button>

            <p className="admin-inter-webhook-hint">
              A URL pública é configurada no backend via variável de ambiente. Use{' '}
              <strong>Registrar</strong> após configurar as credenciais e certificado do Inter no
              servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
