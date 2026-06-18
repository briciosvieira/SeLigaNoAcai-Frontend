import { api } from './api';
import type { Customer, UpdateCustomerPayload } from '@/types/customer.types';

export async function getCustomersRequest(): Promise<Customer[]> {
  const response = await api.get('/admin/customers');
  return response.data.data;
}

export async function getCustomerByIdRequest(id: string): Promise<Customer> {
  const response = await api.get(`/admin/customers/${id}`);
  return response.data.data;
}

export async function updateCustomerRequest(
  id: string,
  payload: UpdateCustomerPayload,
): Promise<Customer> {
  const response = await api.patch(`/admin/customers/${id}`, payload);
  return response.data.data;
}

export async function updateCustomerStatusRequest(
  id: string,
  isActive: boolean,
): Promise<Customer> {
  const response = await api.patch(`/admin/customers/${id}/status`, { isActive });
  return response.data.data;
}

export async function updateCustomerPasswordRequest(
  id: string,
  newPassword: string,
): Promise<{ updated: boolean }> {
  const response = await api.patch(`/admin/customers/${id}/password`, { newPassword });
  return response.data.data;
}
