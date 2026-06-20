import { api } from './api';
import type {
  LoyaltyMeResponse,
  LoyaltySettings,
  AdminLoyaltyCustomer,
  AdminLoyaltyCustomerListItem,
} from '@/types/loyalty.types';

function unwrap<T>(response: { data: unknown }): T {
  const d = response.data as { data?: T };
  return (d.data ?? response.data) as T;
}

export async function getMyLoyaltyRequest(): Promise<LoyaltyMeResponse> {
  const response = await api.get('/loyalty/me');
  return unwrap<LoyaltyMeResponse>(response);
}

export async function getAdminLoyaltySettingsRequest(): Promise<LoyaltySettings> {
  const response = await api.get('/admin/loyalty/settings');
  return unwrap<LoyaltySettings>(response);
}

export async function updateAdminLoyaltySettingsRequest(
  payload: Partial<LoyaltySettings>,
): Promise<LoyaltySettings> {
  const response = await api.patch('/admin/loyalty/settings', payload);
  return unwrap<LoyaltySettings>(response);
}

function normalizeCustomerSearchResponse(payload: unknown): AdminLoyaltyCustomerListItem[] {
  const source = (payload as Record<string, unknown>)?.data ?? payload;
  if (Array.isArray(source)) return source as AdminLoyaltyCustomerListItem[];
  const s = source as Record<string, unknown>;
  if (Array.isArray(s?.items)) return s.items as AdminLoyaltyCustomerListItem[];
  if (Array.isArray(s?.customers)) return s.customers as AdminLoyaltyCustomerListItem[];
  if (Array.isArray(s?.data)) return s.data as AdminLoyaltyCustomerListItem[];
  return [];
}

export async function searchLoyaltyCustomersRequest(
  search: string,
): Promise<AdminLoyaltyCustomerListItem[]> {
  const response = await api.get('/admin/loyalty/customers', {
    params: { search: search.trim() },
  });
  return normalizeCustomerSearchResponse(response.data);
}

export async function getAdminCustomerLoyaltyRequest(
  customerId: string,
): Promise<AdminLoyaltyCustomer> {
  const response = await api.get(`/admin/loyalty/customers/${customerId}`);
  return unwrap<AdminLoyaltyCustomer>(response);
}

export async function addCustomerLoyaltyStampRequest(
  customerId: string,
  payload: { quantity: number; reason?: string },
): Promise<AdminLoyaltyCustomer> {
  const response = await api.post(
    `/admin/loyalty/customers/${customerId}/stamps/add`,
    payload,
  );
  return unwrap<AdminLoyaltyCustomer>(response);
}

export async function removeCustomerLoyaltyStampRequest(
  customerId: string,
  payload: { quantity: number; reason?: string },
): Promise<AdminLoyaltyCustomer> {
  const response = await api.post(
    `/admin/loyalty/customers/${customerId}/stamps/remove`,
    payload,
  );
  return unwrap<AdminLoyaltyCustomer>(response);
}

export async function uploadLoyaltyCardImageRequest(
  file: File,
): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/uploads/loyalty-card', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return unwrap<{ url: string }>(response);
}

export async function redeemCustomerLoyaltyRewardRequest(
  customerId: string,
): Promise<AdminLoyaltyCustomer> {
  const response = await api.post(
    `/admin/loyalty/customers/${customerId}/rewards/redeem`,
  );
  return unwrap<AdminLoyaltyCustomer>(response);
}
