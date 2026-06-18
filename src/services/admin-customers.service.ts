import { api } from './api';
import type {
  AdminCustomer,
  AdminCustomerFilters,
  UpdateAdminCustomerPayload,
  UpdateAdminCustomerStatusPayload,
  UpdateAdminCustomerPasswordPayload,
} from '@/types/customer.types';

export async function getAdminCustomersRequest(params?: AdminCustomerFilters): Promise<AdminCustomer[]> {
  const response = await api.get('/admin/customers', { params });
  return response.data.data ?? response.data ?? [];
}

export async function getAdminCustomerByIdRequest(id: string): Promise<AdminCustomer> {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data.data ?? response.data;
}

export async function updateAdminCustomerRequest(
  id: string,
  payload: UpdateAdminCustomerPayload,
): Promise<AdminCustomer> {
  const response = await api.patch(`/admin/customers/${id}`, payload);
  return response.data.data ?? response.data;
}

export async function updateAdminCustomerStatusRequest(
  id: string,
  payload: UpdateAdminCustomerStatusPayload,
): Promise<AdminCustomer> {
  const response = await api.patch(`/admin/customers/${id}/status`, payload);
  return response.data.data ?? response.data;
}

export async function updateAdminCustomerPasswordRequest(
  id: string,
  payload: UpdateAdminCustomerPasswordPayload,
): Promise<void> {
  await api.patch(`/admin/customers/${id}/password`, payload);
}
