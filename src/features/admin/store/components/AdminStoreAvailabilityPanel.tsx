import { useEffect } from 'react';
import type { Store } from '@/types/store.types';
import { useAdminStoreAvailability } from '@/hooks/useAdminStoreAvailability';
import { useStoreAvailabilityCountdown } from '@/hooks/useStoreAvailabilityCountdown';
import { formatRemainingTime } from '@/utils/time';

type AdminStoreAvailabilityPanelProps = {
  store: Store | null;
  onStoreUpdated: (store: Store) => void;
};

export function AdminStoreAvailabilityPanel({
  store,
  onStoreUpdated,
}: AdminStoreAvailabilityPanelProps) {
  const {
    durationOptions,
    selectedMinutes,
    setSelectedMinutes,
    customMinutes,
    setCustomMinutes,
    useCustomMinutes,
    setUseCustomMinutes,
    isUpdatingAvailability,
    availabilityError,
    effectiveMinutes,
    backendUnavailable,
    updateAvailability,
  } = useAdminStoreAvailability({
    store,
    onStoreUpdated,
  });

  const remainingSeconds = useStoreAvailabilityCountdown(
    store?.availability?.remainingSeconds ?? 0
  );

  useEffect(() => {
    if (remainingSeconds === 0 && store?.availability?.availabilityUntil) {
      onStoreUpdated(store);
    }
  }, [remainingSeconds, store?.availability?.availabilityUntil, store, onStoreUpdated]);

  const isOpen = Boolean(store?.availability?.isOpen ?? store?.isOpen);

  return (
    <section className="admin-store-availability-panel">
      <div className="admin-store-availability-top">
        <div>
          <h2 className="admin-store-availability-title">Funcionamento da loja</h2>
          <p className="admin-store-availability-description">Controle se a loja está aberta ou fechada para pedidos.</p>
        </div>

        <div
          className={[
            'admin-store-status-badge',
            isOpen ? 'is-open' : 'is-closed',
          ].join(' ')}
        >
          <span className="admin-store-status-dot" />
          <strong>{isOpen ? 'Aberto' : 'Fechado'}</strong>
        </div>
      </div>

      {remainingSeconds > 0 ? (
        <p className="admin-store-availability-timer">
          {store?.availability?.nextLabel}{' '}
          {formatRemainingTime(remainingSeconds)}
        </p>
      ) : null}

      <div className="admin-store-availability-form">
        <label className="admin-store-availability-field">
          <span>Duração</span>

          <select
            value={selectedMinutes}
            disabled={useCustomMinutes || isUpdatingAvailability}
            onChange={(event) => {
              setSelectedMinutes(Number(event.target.value));
              setUseCustomMinutes(false);
            }}
          >
            {durationOptions.map((option) => (
              <option key={option.minutes} value={option.minutes}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="admin-store-availability-check">
          <input
            type="checkbox"
            checked={useCustomMinutes}
            disabled={isUpdatingAvailability}
            onChange={(event) => setUseCustomMinutes(event.target.checked)}
          />
          <span>Editar tempo em minutos</span>
        </label>

        {useCustomMinutes && (
          <label className="admin-store-availability-field">
            <span>Tempo customizado</span>
            <input
              type="number"
              min={1}
              value={customMinutes}
              disabled={isUpdatingAvailability}
              onChange={(event) => setCustomMinutes(event.target.value)}
              placeholder="Ex: 45"
            />
          </label>
        )}

        <p className="admin-store-availability-helper">
          Tempo selecionado: {effectiveMinutes || 0} minuto(s)
        </p>
      </div>

      {backendUnavailable && (
        <p className="admin-store-availability-warning">
          Controle de funcionamento ainda não disponível no backend.
        </p>
      )}

      {availabilityError && (
        <p className="admin-store-availability-error">{availabilityError}</p>
      )}

      <div className="admin-store-availability-actions">
        <button
          type="button"
          className="admin-store-open-button"
          disabled={isUpdatingAvailability}
          onClick={() => updateAvailability(true)}
        >
          {isUpdatingAvailability ? 'Atualizando...' : 'Abrir loja'}
        </button>

        <button
          type="button"
          className="admin-store-close-button"
          disabled={isUpdatingAvailability}
          onClick={() => updateAvailability(false)}
        >
          {isUpdatingAvailability ? 'Atualizando...' : 'Fechar loja'}
        </button>
      </div>
    </section>
  );
}
