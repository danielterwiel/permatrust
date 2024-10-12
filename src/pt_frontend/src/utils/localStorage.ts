// localStorage.ts

/**
 * Type for the storage value. Extends to allow any JSON-serializable type.
 */
type StorageValue = string | number | boolean | object | null;

/**
 * Options for setting items in localStorage
 */
interface SetOptions {
  /** Expiration time in milliseconds */
  expiresIn?: number;
}

/**
 * Set an item in localStorage
 * @param key - The key to set
 * @param value - The value to store
 * @param options - Optional settings
 */
function setItem<T extends StorageValue>(
  key: string,
  value: T,
  options: SetOptions = {},
): void {
  try {
    const item = {
      value,
      expiry: options.expiresIn
        ? new Date().getTime() + options.expiresIn
        : null,
    };
    localStorage.setItem(key, JSON.stringify(item));
  } catch (error) {
    console.error(`Error setting localStorage item: ${error}`);
  }
}

// TODO: this implementation is suboptimal. We need it to read the value from the localStorage using the type it was stored with.
// Currently we have to use the `as` keyword to cast the value to the expected type. This is not ideal. Also, it should throw an
// error, leading to a .logout() when thrown, unless we anticipate that the value might not be there. Then we use the `throwWhenNotFound`
/**
 * Get an item from localStorage
 * @param key - The key to retrieve
 * @param throwWhenNotFound - Whether to throw an error when the item is not found in localStorage
 * @returns The stored value, or null if not found or expired
 */
function getItem<T extends StorageValue>(
  key: string,
  throwWhenNotFound = true,
): T | null {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);

    if (item.expiry && new Date().getTime() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.value as T;
  } catch (error) {
    if (throwWhenNotFound && error instanceof Error) {
      throw error;
    }
    console.error(`Error getting localStorage item: ${error}`);
    return null;
  }
}

/**
 * Remove an item from localStorage
 * @param key - The key to remove
 */
function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing localStorage item: ${error}`);
  }
}

/**
 * Clear all items from localStorage
 */
function clear(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error(`Error clearing localStorage: ${error}`);
  }
}

/**
 * Get all keys from localStorage
 * @returns An array of keys
 */
function getAllKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.error(`Error getting all localStorage keys: ${error}`);
    return [];
  }
}

clear;
/**
 * Check if a key exists in localStorage
 * @param key - The key to check
 * @returns True if the key exists, false otherwise
 */
function hasItem(key: string): boolean {
  return getItem(key) !== null;
}

/**
 * Get the size of localStorage in bytes
 * @returns The size in bytes
 */
function getSize(): number {
  try {
    return new Blob(Object.values(localStorage)).size;
  } catch (error) {
    console.error(`Error getting localStorage size: ${error}`);
    return 0;
  }
}

export const storage = {
  setItem,
  getItem,
  removeItem,
  clear,
  getAllKeys,
  hasItem,
  getSize,
};
