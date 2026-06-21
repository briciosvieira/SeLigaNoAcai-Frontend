import type { AdminPermission, UserRole } from './admin.types';

export type AuthUser = {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: UserRole;
  permissions?: AdminPermission[];
  isActive: boolean;
  createdAt: string;
  avatarUrl?: string | null;
  googleAvatarUrl?: string | null;
  customerCode?: string | null;
  termsAcceptedAt?: string | null;
  privacyAcceptedAt?: string | null;
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
  fullName: string;
  email: string;
  phone?: string;
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
