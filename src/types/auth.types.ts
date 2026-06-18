import type { AdminPermission, UserRole } from './admin.types';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions?: AdminPermission[];
  isActive: boolean;
  createdAt: string;
};

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type RegisterPayload = {
  name: string;
  email: string;
  phone: string;
  password: string;
};

export type GoogleLoginPayload = {
  idToken: string;
};

export type RefreshPayload = {
  refreshToken: string;
};

export type ChangeMyPasswordPayload = {
  currentPassword: string;
  newPassword: string;
};
