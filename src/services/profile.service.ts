import { api } from './api';
import type {
  CustomerDefaultAddress,
  CustomerMe,
  UpdateMePayload,
  UpdateMyPasswordPayload,
  UpsertDefaultAddressPayload,
} from '@/types/profile.types';

function unwrap<T>(response: { data: unknown }): T {
  const d = response.data as { data?: T };
  return (d.data ?? response.data) as T;
}

export async function getCustomerMeRequest(): Promise<CustomerMe> {
  const response = await api.get('/auth/me');
  return unwrap<CustomerMe>(response);
}

export async function updateMeRequest(payload: UpdateMePayload): Promise<CustomerMe> {
  const response = await api.patch('/auth/me', payload);
  return unwrap<CustomerMe>(response);
}

export async function updateMyPasswordRequest(
  payload: UpdateMyPasswordPayload,
): Promise<{ updated: boolean }> {
  const response = await api.patch('/auth/me/password', payload);
  return unwrap<{ updated: boolean }>(response);
}

export async function getMyDefaultAddressRequest(): Promise<CustomerDefaultAddress | null> {
  try {
    const response = await api.get('/customers/me/address/default');
    return unwrap<CustomerDefaultAddress | null>(response);
  } catch (err: unknown) {
    const e = err as { response?: { status?: number } };
    if (e?.response?.status === 404) return null;
    throw err;
  }
}

export async function upsertMyDefaultAddressRequest(
  payload: UpsertDefaultAddressPayload,
): Promise<CustomerDefaultAddress> {
  const response = await api.put('/customers/me/address/default', payload);
  return unwrap<CustomerDefaultAddress>(response);
}

export async function uploadCustomerAvatarRequest(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<{ url: string }>(response);
}
