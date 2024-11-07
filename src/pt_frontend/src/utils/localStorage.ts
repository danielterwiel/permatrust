export const getItem = <T>(key: string, initialValue: T): T => {
  if (typeof globalThis === 'undefined') {
    return initialValue;
  }

  try {
    const item = globalThis.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch (error) {
    console.warn(`Error reading localStorage key "${key}":`, error);
    return initialValue;
  }
};

export const setItem = <T>(key: string, value: T): void => {
  if (typeof globalThis === 'undefined') {
    return;
  }

  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Error setting localStorage key "${key}":`, error);
  }
};

export const storage = {
  getItem,
  setItem,
};
