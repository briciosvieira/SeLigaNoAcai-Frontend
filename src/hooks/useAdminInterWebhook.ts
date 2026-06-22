import { useState, useCallback } from 'react';
import type { InterPixWebhookInfo } from '@/types/inter-webhook.types';
import {
  getInterPixWebhookRequest,
  validateInterPixWebhookRequest,
  registerInterPixWebhookRequest,
} from '@/services/inter-webhook.service';

function getErrorMsg(err: unknown): string {
  const e = err as { response?: { status?: number; data?: { message?: string } }; message?: string };
  if (e?.response?.status === 401 || e?.response?.status === 403) {
    return 'Sem permissão para executar esta operação.';
  }
  return (
    e?.response?.data?.message ??
    e?.message ??
    'Não foi possível executar a operação. Verifique as credenciais, certificado, escopos da API Pix e logs do backend.'
  );
}

export function useAdminInterWebhook() {
  const [webhook, setWebhook] = useState<InterPixWebhookInfo | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const clearMessages = () => {
    setError(null);
    setSuccessMessage(null);
  };

  const loadWebhook = useCallback(async () => {
    setLoading(true);
    clearMessages();
    try {
      const data = await getInterPixWebhookRequest();
      setWebhook(data);
      setLastChecked(new Date());
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const validateWebhook = useCallback(async () => {
    setValidating(true);
    clearMessages();
    try {
      const data = await validateInterPixWebhookRequest();
      setSuccessMessage(data?.message ?? 'URL validada com sucesso no Inter.');
      setWebhook((prev) => (prev ? { ...prev, ...data } : data));
    } catch (err) {
      setError(getErrorMsg(err));
    } finally {
      setValidating(false);
    }
  }, []);

  const registerWebhook = useCallback(async () => {
    setRegistering(true);
    clearMessages();
    try {
      const data = await registerInterPixWebhookRequest();
      setSuccessMessage(data?.message ?? 'Webhook cadastrado/atualizado com sucesso no Inter.');
      const updated = await getInterPixWebhookRequest();
      setWebhook(updated);
      setLastChecked(new Date());
    } catch (err) {
      setError(getErrorMsg(err));
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
