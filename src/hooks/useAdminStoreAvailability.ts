import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getStoreAvailabilityDurationOptionsRequest,
  updateCurrentStoreAvailabilityRequest,
} from '@/services/store.service';
import type {
  Store,
  StoreAvailabilityDurationOption,
} from '@/types/store.types';
import { getErrorMessage } from '@/utils/format.util';

const FALLBACK_STORE_DURATION_OPTIONS: StoreAvailabilityDurationOption[] = [
  { label: '5 minutos', minutes: 5 },
  { label: '10 minutos', minutes: 10 },
  { label: '30 minutos', minutes: 30 },
  { label: '40 minutos', minutes: 40 },
  { label: '1 hora', minutes: 60 },
  { label: '1 hora e meia', minutes: 90 },
  { label: '2 horas', minutes: 120 },
  { label: '2 horas e meia', minutes: 150 },
  { label: '3 horas', minutes: 180 },
  { label: '5 horas', minutes: 300 },
  { label: '10 horas', minutes: 600 },
  { label: '24 horas', minutes: 1440 },
  { label: '2 dias', minutes: 2880 },
  { label: '3 dias', minutes: 4320 },
  { label: '4 dias', minutes: 5760 },
  { label: '1 semana', minutes: 10080 },
];

export function useAdminStoreAvailability(params: {
  store: Store | null;
  onStoreUpdated?: (store: Store) => void;
}) {
  const [durationOptions, setDurationOptions] = useState<
    StoreAvailabilityDurationOption[]
  >(FALLBACK_STORE_DURATION_OPTIONS);

  const [selectedMinutes, setSelectedMinutes] = useState<number>(30);
  const [customMinutes, setCustomMinutes] = useState<string>('');
  const [useCustomMinutes, setUseCustomMinutes] = useState(false);

  const [isUpdatingAvailability, setIsUpdatingAvailability] = useState(false);
  const [availabilityError, setAvailabilityError] = useState<string | null>(
    null,
  );
  const [backendUnavailable, setBackendUnavailable] = useState(false);

  const effectiveMinutes = useMemo(() => {
    if (useCustomMinutes) {
      return Number(customMinutes);
    }
    return Number(selectedMinutes);
  }, [customMinutes, selectedMinutes, useCustomMinutes]);

  const loadDurationOptions = useCallback(async () => {
    try {
      const options = await getStoreAvailabilityDurationOptionsRequest();

      if (Array.isArray(options) && options.length > 0) {
        setDurationOptions(options);
        setSelectedMinutes(options[0].minutes);
      }
    } catch (error) {
      console.warn('Duration options endpoint unavailable:', error);
      setDurationOptions(FALLBACK_STORE_DURATION_OPTIONS);
    }
  }, []);

  const updateAvailability = useCallback(
    async (isOpen: boolean) => {
      setAvailabilityError(null);
      setBackendUnavailable(false);

      if (!Number.isFinite(effectiveMinutes) || effectiveMinutes <= 0) {
        setAvailabilityError('Informe um tempo válido em minutos.');
        return;
      }

      setIsUpdatingAvailability(true);

      try {
        const updatedStore = await updateCurrentStoreAvailabilityRequest({
          isOpen,
          durationMinutes: effectiveMinutes,
        });

        params.onStoreUpdated?.(updatedStore);
      } catch (error) {
        const anyError = error as any;

        if (anyError?.response?.status === 404) {
          setBackendUnavailable(true);
          setAvailabilityError(
            'Endpoint de funcionamento da loja ainda não está disponível.',
          );
          return;
        }

        setAvailabilityError(getErrorMessage(error));
      } finally {
        setIsUpdatingAvailability(false);
      }
    },
    [effectiveMinutes, params],
  );

  useEffect(() => {
    void loadDurationOptions();
  }, [loadDurationOptions]);

  return {
    durationOptions,
    selectedMinutes,
    setSelectedMinutes,
    customMinutes,
    setCustomMinutes,
    useCustomMinutes,
    setUseCustomMinutes,
    effectiveMinutes,
    isUpdatingAvailability,
    availabilityError,
    backendUnavailable,
    updateAvailability,
  };
}
