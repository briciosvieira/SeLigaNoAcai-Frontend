import { api } from './api';
import type {
  AuthResponse,
  LoginPayload,
  RegisterPayload,
  GoogleLoginPayload,
  ChangeMyPasswordPayload,
  AuthUser,
} from '@/types/auth.types';

export async function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/login', payload);
  return response.data.data;
}

export async function registerRequest(payload: RegisterPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/register', payload);
  return response.data.data;
}

export async function googleLoginRequest(payload: GoogleLoginPayload): Promise<AuthResponse> {
  const response = await api.post('/auth/google', payload);
  return response.data.data;
}

export async function getMeRequest(): Promise<AuthUser> {
  const response = await api.get('/auth/me');
  return response.data.data;
}

export async function logoutRequest(): Promise<void> {
  await api.post('/auth/logout');
}

export async function refreshTokenRequest(refreshToken: string): Promise<AuthResponse> {
  const response = await api.post('/auth/refresh', { refreshToken });
  return response.data.data;
}

export async function changeMyPasswordRequest(
  payload: ChangeMyPasswordPayload,
): Promise<{ updated: boolean }> {
  const response = await api.patch('/auth/me/password', payload);
  return response.data.data;
}
