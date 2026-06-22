import { useState, useCallback } from 'react';
import {
  getInterPixWebhookRequest,
  validateInterPixWebhookRequest,
  registerInterPixWebhookRequest,
} from '@/services/inter-webhook.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFriendlyWebhookError(error: any): string {
  const status = error?.response?.status as number | undefined;
  const message =
    (error?.response?.data?.message as string | undefined) ??
    (error?.response?.data?.error as string | undefined) ??
    (error?.message as string | undefined);

  if (status === 401 || status === 403) {
    return 'Você não tem permissão para gerenciar o webhook do Inter.';
  }

  if (status === 404) {
    return 'Endpoint de webhook admin não encontrado no backend. Verifique se o backend foi publicado com as rotas /admin/inter/pix/webhook.';
  }

  if (status === 500) {
    return message ?? 'Erro interno no backend. Verifique credenciais, certificados e logs do Inter.';
  }

  if (!status) {
    return 'Não foi possível conectar ao backend.';
  }

  return message ?? 'Não foi possível executar a operação.';
}

export function useAdminInterWebhook() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [webhook, setWebhook] = useState<any>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function clearMessages() {
    setError(null);
    setSuccessMessage(null);
  }

  const loadWebhook = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const data = await getInterPixWebhookRequest();
      setWebhook(data ?? null);
      setLastChecked(new Date());
    } catch (err) {
      setError(getFriendlyWebhookError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const validateWebhook = useCallback(async () => {
    setValidating(true);
    clearMessages();
    try {
      const data = await validateInterPixWebhookRequest();
      setSuccessMessage((data?.message as string | undefined) ?? 'URL validada com sucesso no Inter.');
    } catch (err) {
      setError(getFriendlyWebhookError(err));
    } finally {
      setValidating(false);
    }
  }, []);

  const registerWebhook = useCallback(async () => {
    setRegistering(true);
    clearMessages();
    try {
      const data = await registerInterPixWebhookRequest();
      setSuccessMessage((data?.message as string | undefined) ?? 'Webhook cadastrado/atualizado com sucesso no Inter.');
      const updated = await getInterPixWebhookRequest();
      setWebhook(updated ?? null);
      setLastChecked(new Date());
    } catch (err) {
      setError(getFriendlyWebhookError(err));
    } finally {
      setRegistering(false);
    }
  }, []);

  return {
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
  };
}
