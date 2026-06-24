import { api } from './api';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function unwrapData(response: any): any {
  return response?.data?.data ?? response?.data ?? response;
}

export type PasswordRecoverySettings = {
  id?: string;
  senderName: string;
  replyToEmail?: string | null;
  subject: string;
  bodyTemplate: string;
  isActive: boolean;
};

export async function getPasswordRecoverySettingsRequest(): Promise<PasswordRecoverySettings> {
  const response = await api.get('/admin/password-recovery-settings');
  return unwrapData(response);
}

export async function updatePasswordRecoverySettingsRequest(
  payload: PasswordRecoverySettings,
): Promise<PasswordRecoverySettings> {
  const response = await api.patch('/admin/password-recovery-settings', payload);
  return unwrapData(response);
}

export async function sendPasswordRecoveryTestEmailRequest(email: string): Promise<void> {
  const response = await api.post('/admin/password-recovery-settings/test-email', { email });
  return unwrapData(response);
}
