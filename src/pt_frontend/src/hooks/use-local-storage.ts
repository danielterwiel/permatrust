import { useCallback, useEffect, useState } from 'react';

import { storage } from '@/utils/local-storage';

const localStorageChangeEvent = new Event('localStorageChange');

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: ((val: T) => T) | T) => void] {
  const readValue = useCallback((): T => {
    return storage.getItem(key, initialValue);
  }, [initialValue, key]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = (value: ((val: T) => T) | T) => {
    try {
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;

      setStoredValue(valueToStore);

      if (typeof globalThis !== 'undefined') {
        globalThis.localStorage.setItem(key, JSON.stringify(valueToStore));
        // Dispatch custom event
        window.dispatchEvent(localStorageChangeEvent);
      }
    } catch {
      // TODO: handle error
    }
  };

  useEffect(() => {
    setStoredValue(readValue());
  }, [readValue]);

  useEffect(() => {
    const handleStorageChange = () => {
      const newValue = storage.getItem(key, initialValue);
      if (JSON.stringify(newValue) !== JSON.stringify(storedValue)) {
        setStoredValue(newValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('localStorageChange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('localStorageChange', handleStorageChange);
    };
  }, [key, initialValue, storedValue]);

  return [storedValue, setValue];
}
