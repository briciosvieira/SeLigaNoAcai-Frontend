import axios from 'axios';
import { env } from '@/config/env';
import { useAuthStore } from '@/store/auth.store';

export const api = axios.create({
  baseURL: env.apiUrl,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = useAuthStore.getState().accessToken;
      if (token) {
        // Havia token mas está inválido/expirado → limpa sessão e redireciona
        useAuthStore.getState().clearAuth();
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
      // Sem token: guest acessou endpoint protegido → deixa o erro propagar
    }
    return Promise.reject(error);
  },
);
