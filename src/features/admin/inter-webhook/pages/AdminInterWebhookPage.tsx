import { useEffect } from 'react';
import { RefreshCw, Zap, CheckCircle, AlertCircle } from 'lucide-react';
import { useAdminInterWebhook } from '@/hooks/useAdminInterWebhook';
import { formatDateTime } from '@/utils/date.util';
import '../admin-inter-webhook.css';

export function AdminInterWebhookPage() {
  const {
    webhook,
    hasLoaded,
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

  const expectedUrl = webhook?.expectedWebhookUrl ?? null;

  const registeredUrl =
    webhook?.registeredWebhookUrl ??
    webhook?.webhookUrl ??
    null;

  const hasQueryError = Boolean(error);

  const isRegistered =
    Boolean(expectedUrl && registeredUrl) &&
    expectedUrl === registeredUrl;

  const statusLabel = hasQueryError
    ? 'Erro ao consultar'
    : !hasLoaded
      ? 'Ainda não consultado'
      : isRegistered
        ? 'Cadastrado corretamente'
        : 'Não cadastrado';

  const statusClass = hasQueryError
    ? 'is-error'
    : !hasLoaded
      ? 'is-pending'
      : isRegistered
        ? 'is-ok'
        : 'is-empty';

  const isAnythingLoading = loading || validating || registering;

  // Last checked timestamp is derived from hasLoaded + loading (approximation without extra state)
  const showLastChecked = hasLoaded && !loading;

  return (
    <div className="admin-inter-webhook-page">
      <div className="admin-inter-webhook-header">
        <h1>Integração PIX Inter</h1>
        <p>
          A URL pública esperada é definida pelo backend via variável de ambiente{' '}
          <strong>INTER_PIX_WEBHOOK_URL</strong>. Use esta tela apenas para consultar, validar e
          registrar o webhook no Inter.
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
                <strong className={expectedUrl ? 'breakable expected' : 'muted'}>
                  {expectedUrl ?? 'URL não informada pelo backend'}
                </strong>
              </div>

              <div className="admin-inter-webhook-row">
                <span>URL cadastrada no Inter</span>
                <strong className={registeredUrl ? `breakable${isRegistered ? ' ok' : ' mismatch'}` : 'muted'}>
                  {hasQueryError
                    ? 'Não foi possível consultar.'
                    : registeredUrl
                      ? registeredUrl
                      : hasLoaded
                        ? 'Nenhum webhook cadastrado encontrado.'
                        : 'Ainda não consultado.'}
                </strong>
              </div>

              <div className="admin-inter-webhook-row">
                <span>Status</span>
                <span className={`admin-inter-webhook-badge ${statusClass}`}>
                  {statusLabel}
                </span>
              </div>

              {showLastChecked && (
                <div className="admin-inter-webhook-row">
                  <span>Última consulta</span>
                  <strong>{formatDateTime(new Date().toISOString())}</strong>
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
              A URL pública é configurada no backend via{' '}
              <strong>INTER_PIX_WEBHOOK_URL</strong>. Use <strong>Registrar</strong> após
              configurar as credenciais e certificado do Inter no servidor.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
