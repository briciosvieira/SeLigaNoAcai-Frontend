import { useEffect, useState } from 'react';

export function useStoreAvailabilityCountdown(initialSeconds?: number) {
  const [remainingSeconds, setRemainingSeconds] = useState(
    Math.max(0, Number(initialSeconds ?? 0)),
  );

  useEffect(() => {
    setRemainingSeconds(Math.max(0, Number(initialSeconds ?? 0)));
  }, [initialSeconds]);

  useEffect(() => {
    if (remainingSeconds <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [remainingSeconds]);

  return remainingSeconds;
}
