import type { Store, StoreAvailability } from "@/types/store.types";
import { formatRemainingTime } from "@/utils/time";
import "@/styles/store-availability.css";

export function getStoreIsOpen(store?: Store | null): boolean {
  if (!store) return false;
  return Boolean(store.availability?.isOpen ?? store.isOpen ?? false);
}

export function getStoreAvailabilityLabel(store?: Store | null): string {
  return getStoreIsOpen(store) ? "Aberto" : "Fechado";
}

type StoreAvailabilityBadgeProps = {
  store?: Store | null;
  availability?: StoreAvailability | null;
  remainingSeconds?: number;
  compact?: boolean;
};

export function StoreAvailabilityBadge({
  store,
  availability,
  remainingSeconds,
  compact = false,
}: StoreAvailabilityBadgeProps) {
  const displaySeconds =
    remainingSeconds ??
    availability?.remainingSeconds ??
    store?.availability?.remainingSeconds ??
    0;

  const isOpen = store ? getStoreIsOpen(store) : Boolean(availability?.isOpen);

  const label =
    availability?.label ??
    store?.availability?.label ??
    (isOpen ? "Aberto" : "Fechado");
  const nextLabel =
    availability?.nextLabel ?? store?.availability?.nextLabel ?? null;

  return (
    <div
      className={[
        "store-availability-badge",
        isOpen ? "is-open" : "is-closed",
        compact ? "compact" : "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <span className="store-availability-dot" />

      <div className="store-availability-text">
        <strong>{label}</strong>

        {nextLabel && displaySeconds > 0 && (
          <span>
            {nextLabel} {formatRemainingTime(displaySeconds)}
          </span>
        )}
      </div>
    </div>
  );
}
