import type { Store } from '@/types/store.types';
import { useAdminStoreAvailability } from '@/hooks/useAdminStoreAvailability';
import { useStoreAvailabilityCountdown } from '@/hooks/useStoreAvailabilityCountdown';
import { formatRemainingTime } from '@/utils/time';
import '@/styles/store-availability.css';

type AdminStoreAvailabilityPanelProps = {
  store: Store | null;
  onStoreUpdated: (store: Store) => void;
  onReloadStore?: () => void;
};

export function AdminStoreAvailabilityPanel({
  store,
  onStoreUpdated,
  onReloadStore,
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

  // When countdown hits 0, ask the parent to reload store from the API
  const remainingSeconds = useStoreAvailabilityCountdown(
    store?.availability?.remainingSeconds ?? 0,
    onReloadStore,
  );

  const isOpen = Boolean(store?.availability?.isOpen ?? store?.isOpen);
  const nextLabel = store?.availability?.nextLabel ?? null;

  return (
    <section className="admin-store-availability-panel">
      <div className="admin-store-availability-top">
        <div>
          <h2 className="admin-store-availability-title">Funcionamento da loja</h2>
          <p className="admin-store-availability-description">
            Controle se a loja está aberta ou fechada para pedidos.
          </p>
        </div>

        <div
          className={[
            'admin-store-status-badge',
            isOpen ? 'is-open' : 'is-closed',
          ].join(' ')}
        >
          <span className="admin-store-status-dot" />
          <div>
            <strong>{isOpen ? 'Aberto' : 'Fechado'}</strong>
            {nextLabel && remainingSeconds > 0 && (
              <span className="admin-store-status-hint">
                {nextLabel} {formatRemainingTime(remainingSeconds)}
              </span>
            )}
          </div>
        </div>
      </div>

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
          Em {effectiveMinutes || 0} minuto(s) o status vai mudar.
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
