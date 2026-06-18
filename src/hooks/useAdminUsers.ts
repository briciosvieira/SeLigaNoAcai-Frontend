import { useState } from 'react';
import {
  getAdminUsersRequest,
  getAdminUserByIdRequest,
  createAdminUserRequest,
  updateAdminUserRequest,
  updateAdminUserRoleRequest,
  updateAdminUserStatusRequest,
  updateAdminUserPermissionsRequest,
  deleteAdminUserRequest,
} from '@/services/admin-users.service';
import type {
  AdminUser,
  AdminPermission,
  CreateAdminUserPayload,
  UpdateAdminUserPayload,
  UserRole,
} from '@/types/admin.types';
import type { AdminUserFilters } from '@/services/admin-users.service';

export function useAdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AdminUserFilters>({});

  async function loadUsers(params?: AdminUserFilters) {
    setIsLoading(true);
    setError(null);
    const active = params ?? filters;
    try {
      const data = await getAdminUsersRequest(active);
      setUsers(data ?? []);
    } catch {
      setError('Erro ao carregar usuários');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function searchUsers(search: string) {
    const next = { ...filters, search: search || undefined };
    setFilters(next);
    await loadUsers(next);
  }

  async function filterByRole(role?: string) {
    const next = { ...filters, role };
    setFilters(next);
    await loadUsers(next);
  }

  async function openUserDetail(id: string) {
    setIsDetailLoading(true);
    try {
      const data = await getAdminUserByIdRequest(id);
      setSelectedUser(data);
    } catch {
      setSelectedUser(null);
    } finally {
      setIsDetailLoading(false);
    }
  }

  function closeUserDetail() {
    setSelectedUser(null);
  }

  async function refreshSelectedUser() {
    if (!selectedUser) return;
    setIsDetailLoading(true);
    try {
      const data = await getAdminUserByIdRequest(selectedUser.id);
      setSelectedUser(data);
    } finally {
      setIsDetailLoading(false);
    }
  }

  async function createUser(payload: CreateAdminUserPayload) {
    await createAdminUserRequest(payload);
    await loadUsers();
  }

  async function updateUser(id: string, payload: UpdateAdminUserPayload) {
    await updateAdminUserRequest(id, payload);
    await loadUsers();
    if (selectedUser?.id === id) await refreshSelectedUser();
  }

  async function updateUserRole(id: string, role: UserRole) {
    await updateAdminUserRoleRequest(id, { role });
    await loadUsers();
    if (selectedUser?.id === id) await refreshSelectedUser();
  }

  async function updateUserStatus(id: string, isActive: boolean) {
    await updateAdminUserStatusRequest(id, { isActive });
    await loadUsers();
    if (selectedUser?.id === id) await refreshSelectedUser();
  }

  async function updateUserPermissions(id: string, permissions: AdminPermission[]) {
    await updateAdminUserPermissionsRequest(id, { permissions });
    await loadUsers();
    if (selectedUser?.id === id) await refreshSelectedUser();
  }

  async function deleteUser(id: string) {
    await deleteAdminUserRequest(id);
    setSelectedUser(null);
    await loadUsers();
  }

  return {
    users,
    selectedUser,
    filters,
    isLoading,
    isDetailLoading,
    error,
    loadUsers,
    searchUsers,
    filterByRole,
    openUserDetail,
    closeUserDetail,
    createUser,
    updateUser,
    updateUserRole,
    updateUserStatus,
    updateUserPermissions,
    deleteUser,
  };
}
