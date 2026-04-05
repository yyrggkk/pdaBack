import { useEffect, useRef, useCallback } from 'react';

/**
 * S-F6: Polling fallback hook.
 * Calls `callback` every `intervalMs` while `enabled` is true.
 * Automatically cleans up on unmount.
 */
export function usePolling(
  callback: () => void | Promise<void>,
  intervalMs: number = 10000,
  enabled: boolean = true
) {
  const savedCallback = useRef(callback);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Update saved callback if it changes
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const stop = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    if (enabled) {
      // Call immediately on start
      savedCallback.current();
      intervalRef.current = setInterval(() => {
        savedCallback.current();
      }, intervalMs);
    }
  }, [enabled, intervalMs, stop]);

  useEffect(() => {
    if (enabled) {
      start();
    } else {
      stop();
    }
    return stop;
  }, [enabled, start, stop]);

  return { start, stop };
}
