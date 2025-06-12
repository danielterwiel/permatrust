const getItem = <T>(key: string, initialValue: T): T => {
  if (typeof globalThis === 'undefined') {
    return initialValue;
  }

  try {
    const item = globalThis.localStorage.getItem(key);
    return item ? (JSON.parse(item) as T) : initialValue;
  } catch {
    // TODO: handle error
    return initialValue;
  }
};

const setItem = <T>(key: string, value: T): void => {
  if (typeof globalThis === 'undefined') {
    return;
  }

  try {
    globalThis.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // TODO: handle error
  }
};

export const storage = {
  getItem,
  setItem,
};
