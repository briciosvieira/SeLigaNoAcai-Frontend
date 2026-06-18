import { api } from './api';
import type {
  AdminUser,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UpdateAdminUserRolePayload,
  UpdateAdminUserStatusPayload,
  UpdateAdminUserPermissionsPayload,
} from '@/types/admin.types';

export type AdminUserFilters = {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
};

export async function getAdminUsersRequest(params?: AdminUserFilters): Promise<AdminUser[]> {
  const response = await api.get('/admin/users', { params });
  return response.data.data ?? response.data ?? [];
}

export async function getAdminUserByIdRequest(id: string): Promise<AdminUser> {
  const response = await api.get(`/admin/users/${id}`);
  return response.data.data ?? response.data;
}

export async function createAdminUserRequest(payload: CreateAdminUserPayload): Promise<AdminUser> {
  const response = await api.post('/admin/users', payload);
  return response.data.data ?? response.data;
}

export async function updateAdminUserRequest(
  id: string,
  payload: UpdateAdminUserPayload,
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}`, payload);
  return response.data.data ?? response.data;
}

export async function updateAdminUserRoleRequest(
  id: string,
  payload: UpdateAdminUserRolePayload,
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}/role`, payload);
  return response.data.data ?? response.data;
}

export async function updateAdminUserStatusRequest(
  id: string,
  payload: UpdateAdminUserStatusPayload,
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}/status`, payload);
  return response.data.data ?? response.data;
}

export async function updateAdminUserPermissionsRequest(
  id: string,
  payload: UpdateAdminUserPermissionsPayload,
): Promise<AdminUser> {
  const response = await api.patch(`/admin/users/${id}/permissions`, payload);
  return response.data.data ?? response.data;
}

export async function deleteAdminUserRequest(id: string): Promise<void> {
  await api.delete(`/admin/users/${id}`);
}
