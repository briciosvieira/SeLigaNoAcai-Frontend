import { useAuthStore } from '@/store/auth.store';
import type { AdminPermission } from '@/types/admin.types';

export function usePermissions() {
  const user = useAuthStore((s) => s.user);
  const role = user?.role;

  const isAdmin = role === 'ADMIN';
  const isStaff = role === 'STAFF';
  const isAdminOrStaff = isAdmin || isStaff;

  function hasPermission(permission: AdminPermission): boolean {
    if (isAdmin) return true;
    return user?.permissions?.includes(permission) ?? false;
  }

  return {
    isAdmin,
    isStaff,
    isAdminOrStaff,
    hasPermission,
    canCreateUsers: isAdmin,
    canEditUsers: isAdmin,
    canViewUsers: isAdmin,
    canChangeRoles: isAdmin,
    canChangePermissions: isAdmin,
    canDeleteUsers: isAdmin,
    canManageCustomers: isAdminOrStaff,
  };
}
