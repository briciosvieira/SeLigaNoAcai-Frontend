import { useState, useCallback } from 'react';
import {
  getInterPixWebhookRequest,
  validateInterPixWebhookRequest,
  registerInterPixWebhookRequest,
} from '@/services/inter-webhook.service';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeInterWebhookResponse(data: any) {
  const payload = data?.data ?? data ?? {};

  return {
    expectedWebhookUrl:
      (payload.expectedWebhookUrl as string | null | undefined) ??
      (payload.expectedUrl as string | null | undefined) ??
      null,

    registeredWebhookUrl:
      (payload.registeredWebhookUrl as string | null | undefined) ??
      (payload.webhookUrl as string | null | undefined) ??
      (payload.url as string | null | undefined) ??
      null,

    webhookUrl:
      (payload.webhookUrl as string | null | undefined) ??
      (payload.registeredWebhookUrl as string | null | undefined) ??
      (payload.url as string | null | undefined) ??
      null,

    isRegistered: Boolean(payload.isRegistered),
    status: (payload.status as string | null | undefined) ?? null,
    message: (payload.message as string | undefined) ?? null,
    success: payload.success as boolean | undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getFriendlyWebhookError(error: any): string {
  const status = error?.response?.status as number | undefined;
  const backendMessage: string | undefined =
    error?.response?.data?.message ??
    error?.response?.data?.error ??
    error?.message;

  if (status === 401 || status === 403) {
    return 'Você não tem permissão para gerenciar o webhook do Inter.';
  }

  if (status === 404) {
    return 'Endpoint de webhook admin não encontrado no backend. Verifique se o backend foi publicado com as rotas /admin/inter/pix/webhook.';
  }

  if (status === 500) {
    return backendMessage ?? 'Erro interno no backend. Verifique credenciais, certificados, escopos da API Pix e logs do backend.';
  }

  if (!status) {
    return 'Não foi possível conectar ao backend.';
  }

  return backendMessage ?? 'Não foi possível executar a operação.';
}

export type NormalizedWebhook = ReturnType<typeof normalizeInterWebhookResponse>;

export function useAdminInterWebhook() {
  const [webhook, setWebhook] = useState<NormalizedWebhook | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);
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
      const raw = await getInterPixWebhookRequest();
      setWebhook(normalizeInterWebhookResponse(raw));
      setHasLoaded(true);
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
      const raw = await validateInterPixWebhookRequest();
      const normalized = normalizeInterWebhookResponse(raw);
      setSuccessMessage(normalized.message ?? 'URL validada com sucesso no Inter.');
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
      const raw = await registerInterPixWebhookRequest();
      const normalized = normalizeInterWebhookResponse(raw);
      setSuccessMessage(normalized.message ?? 'Webhook cadastrado/atualizado com sucesso no Inter.');
      // Reload to get the latest registered URL from backend
      const updatedRaw = await getInterPixWebhookRequest();
      setWebhook(normalizeInterWebhookResponse(updatedRaw));
      setHasLoaded(true);
    } catch (err) {
      setError(getFriendlyWebhookError(err));
    } finally {
      setRegistering(false);
    }
  }, []);

  return {
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
  };
}
