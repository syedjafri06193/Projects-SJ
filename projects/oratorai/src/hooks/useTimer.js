import { useState, useRef, useCallback } from 'react';

/**
 * useTimer — simple count-up timer returning formatted MM:SS string.
 */
export function useTimer() {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef(null);

  const start = useCallback(() => {
    setSeconds(0);
    intervalRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
  }, []);

  const stop = useCallback(() => {
    clearInterval(intervalRef.current);
  }, []);

  const reset = useCallback(() => {
    clearInterval(intervalRef.current);
    setSeconds(0);
  }, []);

  const display = `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;

  return { seconds, display, start, stop, reset };
}
