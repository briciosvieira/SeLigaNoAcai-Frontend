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

  const EXPECTED_WEBHOOK_URL = 'https://api.seliganoacai.com.br/payments/webhook/inter';

  const webhookUrl = webhook?.webhookUrl ?? webhook?.url ?? null;
  const isAnythingLoading = loading || validating || registering;

  return (
    <div className="admin-inter-webhook-page">
      <div className="admin-inter-webhook-header">
        <h1>Integração PIX Inter</h1>
        <p>
          Gerencie a URL de webhook usada pelo Banco Inter para confirmar pagamentos PIX
          automaticamente. Use os botões abaixo para consultar, validar e registrar o webhook.
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
                <strong className="breakable expected">{EXPECTED_WEBHOOK_URL}</strong>
              </div>

              <div className="admin-inter-webhook-row">
                <span>URL cadastrada no Inter</span>
                {webhookUrl ? (
                  <strong className={`breakable${webhookUrl === EXPECTED_WEBHOOK_URL ? ' ok' : ' mismatch'}`}>
                    {webhookUrl}
                  </strong>
                ) : (
                  <strong className="muted">
                    {webhook ? 'Nenhum webhook cadastrado encontrado.' : 'Ainda não consultado.'}
                  </strong>
                )}
              </div>

              <div className="admin-inter-webhook-row">
                <span>Status</span>
                <span className={`admin-inter-webhook-badge ${webhookUrl ? 'is-ok' : 'is-empty'}`}>
                  {webhookUrl ? 'Cadastrado' : 'Não cadastrado'}
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
              Consultar webhook
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
              Validar URL no Inter
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
              Registrar / Atualizar webhook
            </button>

            <p className="admin-inter-webhook-hint">
              O backend registra automaticamente a URL{' '}
              <strong>payments/webhook/inter</strong> no Inter. Use{' '}
              <strong>Registrar</strong> após configurar as credenciais e certificado do Inter no
              ambiente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
