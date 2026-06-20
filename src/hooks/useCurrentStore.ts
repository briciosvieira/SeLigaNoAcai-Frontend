import { useState, useEffect } from 'react';
import { getCurrentStoreRequest } from '@/services/store.service';
import type { Store } from '@/types/store.types';

export function useCurrentStore() {
  const [store, setStore] = useState<Store | null>(null);

  useEffect(() => {
    getCurrentStoreRequest()
      .then((s) => setStore(s))
      .catch(() => {});
  }, []);

  return store;
}
