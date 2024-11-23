import { useCallback, useEffect, useRef } from 'react';

import type { UseFormWatch } from 'react-hook-form';

export function useDebouncedWatch<T extends object>(
  watch: UseFormWatch<T>,
  callback: (value: T) => void,
  delay = 300,
) {
  const timeoutRef = useRef<NodeJS.Timeout>();

  const debouncedCallback = useCallback(
    (value: T) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(value);
      }, delay);
    },
    [callback, delay],
  );

  useEffect(() => {
    const subscription = watch((value) => {
      debouncedCallback(value as T);
    });

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      subscription.unsubscribe();
    };
  }, [watch, debouncedCallback]);
}
