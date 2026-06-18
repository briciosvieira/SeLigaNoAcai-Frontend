import { useAuthStore } from '@/store/auth.store';
import { getMeRequest } from '@/services/auth.service';
import { useState } from 'react';

export function useProfile() {
  const { user, setUser } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function reloadProfile() {
    setIsLoading(true);
    setError(null);
    try {
      const me = await getMeRequest();
      setUser(me);
      return me;
    } catch {
      setError('Erro ao carregar perfil');
    } finally {
      setIsLoading(false);
    }
  }

  return { user, isLoading, error, reloadProfile };
}
