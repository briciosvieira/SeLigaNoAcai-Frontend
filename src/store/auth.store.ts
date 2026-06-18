import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@/types/auth.types';

type AuthState = {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  setAuth: (params: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  setUser: (user: AuthUser | null) => void;
  setGuestMode: (isGuest: boolean) => void;
  clearAuth: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isGuest: false,

      setAuth: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true, isGuest: false }),

      setUser: (user) => set({ user }),

      setGuestMode: (isGuest) => set({ isGuest }),

      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
          isGuest: false,
        }),
    }),
    { name: 'seliga-auth' },
  ),
);
