import { api } from './api';
import type { AdminUser } from '@/types/admin.types';
import type { DashboardSummary } from '@/types/admin.types';
import type { AdminPermission } from '@/types/admin.types';

export async function getDashboardSummaryRequest(): Promise<DashboardSummary> {
  const response = await api.get('/dashboard/summary');
  return response.data.data;
}

export async function getPendingOrdersRequest() {
  const response = await api.get('/dashboard/orders/pending');
  return response.data.data;
}

export async function getAdminUsersRequest(): Promise<AdminUser[]> {
  const response = await api.get('/admin/users');
  return response.data.data;
}

export async function getAdminUserByIdRequest(id: string): Promise<AdminUser> {
  const response = await api.get(`/admin/users/${id}`);
  return response.data.data;
}

export async function createAdminUserRequest(
  payload: Omit<AdminUser, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<AdminUser> {
  const response = await api.post('/admin/users', payload);
  return response.data.data;
}

export async function updateAdminUserRequest(
  id: string,
  payload: Partial<AdminUser>,
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}`, payload);
  return response.data.data;
}

export async function updateAdminUserPermissionsRequest(
  id: string,
  permissions: AdminPermission[],
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}/permissions`, { permissions });
  return response.data.data;
}

export async function deleteAdminUserRequest(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}
