import { api } from './api';
import type { InterPixWebhookInfo } from '@/types/inter-webhook.types';

function unwrapData(response: { data?: { data?: unknown } }): InterPixWebhookInfo {
  return (response?.data as { data?: InterPixWebhookInfo })?.data
    ?? (response?.data as InterPixWebhookInfo)
    ?? {};
}

export async function getInterPixWebhookRequest(): Promise<InterPixWebhookInfo> {
  const response = await api.get('/admin/inter/pix/webhook');
  return unwrapData(response);
}

export async function validateInterPixWebhookRequest(): Promise<InterPixWebhookInfo> {
  const response = await api.post('/admin/inter/pix/webhook/validate');
  return unwrapData(response);
}

export async function registerInterPixWebhookRequest(): Promise<InterPixWebhookInfo> {
  const response = await api.post('/admin/inter/pix/webhook/register');
  return unwrapData(response);
}
