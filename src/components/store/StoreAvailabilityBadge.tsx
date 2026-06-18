import type { StoreAvailability } from "@/types/store.types";
import { formatRemainingTime } from "@/utils/time";

type StoreAvailabilityBadgeProps = {
  availability?: StoreAvailability | null;
  remainingSeconds?: number;
  compact?: boolean;
};

export function StoreAvailabilityBadge({
  availability,
  remainingSeconds,
  compact = false,
}: StoreAvailabilityBadgeProps) {
  const displaySeconds = remainingSeconds ?? availability?.remainingSeconds ?? 0;

  const isOpen = Boolean(availability?.isOpen);

  const label = isOpen ? "Aberto" : "Fechado";
  const nextLabel = isOpen ? "Fecha em" : "Abre em";

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

        {displaySeconds > 0 && (
          <span>
            {nextLabel} {formatRemainingTime(displaySeconds)}
          </span>
        )}
      </div>
    </div>
  );
}
