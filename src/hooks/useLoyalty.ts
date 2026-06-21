import { useCallback, useEffect, useState } from 'react';
import { getMyLoyaltyRequest } from '@/services/loyalty.service';
import { useLoyaltyStore } from '@/store/loyalty.store';
import type { LoyaltyMeResponse } from '@/types/loyalty.types';

export function useLoyalty() {
  const [data, setData] = useState<LoyaltyMeResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDisabled, setIsDisabled] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setStore = useLoyaltyStore((s) => s.set);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await getMyLoyaltyRequest();
      setData(result);
      const enabled = result.settings.isEnabled;
      setIsDisabled(!enabled);
      const rewards = result.availableRewards ?? 0;
      setStore({ isEnabled: enabled, availableRewards: rewards });
    } catch (err) {
      const status = (err as { response?: { status?: number } }).response?.status;
      if (status === 404 || status === 403) {
        setIsDisabled(true);
        setStore({ isEnabled: false });
      } else {
        setError('Não foi possível carregar o programa de fidelidade.');
      }
    } finally {
      setIsLoading(false);
    }
  }, [setStore]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, isLoading, isDisabled, error, reload: load };
}
