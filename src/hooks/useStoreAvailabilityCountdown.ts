import { useEffect, useRef, useState } from 'react';

/**
 * Counts down from `initialSeconds` to 0, ticking every second.
 * Calls `onExpire` exactly once when the countdown transitions from >0 to 0.
 * Resets (and resets the expire guard) whenever `initialSeconds` changes.
 */
export function useStoreAvailabilityCountdown(
  initialSeconds?: number,
  onExpire?: () => void,
): number {
  const [remaining, setRemaining] = useState(
    Math.max(0, Number(initialSeconds ?? 0)),
  );

  // Keep onExpire stable so the effect doesn't re-run when the callback reference changes
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Whether this countdown "session" started with a positive value
  const sessionHadTimerRef = useRef(remaining > 0);
  // Guard: fire onExpire at most once per session
  const sessionExpiredRef = useRef(false);

  // Reset when the server-provided initial value changes (e.g. after a store reload)
  useEffect(() => {
    const next = Math.max(0, Number(initialSeconds ?? 0));
    setRemaining(next);
    sessionHadTimerRef.current = next > 0;
    sessionExpiredRef.current = false;
  }, [initialSeconds]);

  // Countdown tick
  useEffect(() => {
    if (remaining <= 0) return;
    const id = window.setInterval(() => {
      setRemaining((s) => Math.max(0, s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [remaining]);

  // Fire onExpire once when the countdown hits 0 after having been positive
  useEffect(() => {
    if (
      remaining === 0 &&
      sessionHadTimerRef.current &&
      !sessionExpiredRef.current
    ) {
      sessionExpiredRef.current = true;
      onExpireRef.current?.();
    }
  }, [remaining]);

  return remaining;
}
