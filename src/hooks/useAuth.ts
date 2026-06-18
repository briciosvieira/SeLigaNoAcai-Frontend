import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  loginRequest,
  logoutRequest,
  getMeRequest,
  changeMyPasswordRequest,
  googleLoginRequest,
  registerRequest,
} from '@/services/auth.service';
import { useAuthStore } from '@/store/auth.store';
import type {
  ChangeMyPasswordPayload,
  LoginPayload,
  RegisterPayload,
} from '@/types/auth.types';
import type { AuthResponse } from '@/types/auth.types';

function redirectAfterLogin(navigate: ReturnType<typeof useNavigate>, _auth: AuthResponse) {
  navigate('/', { replace: true });
}

export function useAuth() {
  const navigate = useNavigate();
  const {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isGuest,
    setAuth,
    setUser,
    setGuestMode,
    clearAuth,
  } = useAuthStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function login(payload: LoginPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const auth = await loginRequest(payload);
      setAuth(auth);
      redirectAfterLogin(navigate, auth);
      return auth;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'E-mail ou senha incorretos';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function googleLogin(idToken: string) {
    setIsLoading(true);
    setError(null);
    try {
      const auth = await googleLoginRequest({ idToken });
      setAuth(auth);
      redirectAfterLogin(navigate, auth);
      return auth;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro no login com Google';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function register(payload: RegisterPayload) {
    setIsLoading(true);
    setError(null);
    try {
      const auth = await registerRequest(payload);
      setAuth(auth);
      navigate('/', { replace: true });
      return auth;
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao criar conta';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function loadMe() {
    try {
      const me = await getMeRequest();
      setUser(me);
      return me;
    } catch {
      clearAuth();
    }
  }

  async function changeMyPassword(payload: ChangeMyPasswordPayload) {
    setIsLoading(true);
    setError(null);
    try {
      return await changeMyPasswordRequest(payload);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Erro ao alterar senha';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      clearAuth();
      navigate('/login', { replace: true });
    }
  }

  function continueAsGuest() {
    clearAuth();
    setGuestMode(true);
    navigate('/', { replace: true });
  }

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    isGuest,
    isLoading,
    error,
    login,
    googleLogin,
    register,
    loadMe,
    changeMyPassword,
    logout,
    continueAsGuest,
    clearError: () => setError(null),
  };
}
