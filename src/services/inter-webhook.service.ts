import { api } from './api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapData(response: any): any {
  return response?.data?.data ?? response?.data ?? response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getInterPixWebhookRequest(): Promise<any> {
  const response = await api.get('/admin/inter/pix/webhook');
  return unwrapData(response);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function validateInterPixWebhookRequest(): Promise<any> {
  const response = await api.post('/admin/inter/pix/webhook/validate');
  return unwrapData(response);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function registerInterPixWebhookRequest(): Promise<any> {
  const response = await api.post('/admin/inter/pix/webhook/register');
  return unwrapData(response);
}
