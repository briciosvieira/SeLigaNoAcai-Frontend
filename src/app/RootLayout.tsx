import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { getMeRequest } from '@/services/auth.service';
import { FullPageSpinner } from '@/components/ui/Spinner';

export function RootLayout() {
  const { accessToken, setUser, clearAuth } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (accessToken) {
      getMeRequest()
        .then((user) => setUser(user))
        .catch(() => clearAuth())
        .finally(() => setReady(true));
    } else {
      setReady(true);
    }
  // executa apenas na montagem inicial
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <FullPageSpinner />;

  return <Outlet />;
}
