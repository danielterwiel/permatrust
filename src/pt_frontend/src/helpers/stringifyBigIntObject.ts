export const stringifyBigIntObject = <T>(obj: T): T => {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj === 'bigint') {
    // Convert BigInt to string
    return obj.toString() as unknown as T;
  }

  if (Array.isArray(obj)) {
    // Recursively process each element in the array
    return obj.map((item) => stringifyBigIntObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    // Preserve the prototype of the original object
    const newObj = Object.create(Object.getPrototypeOf(obj));

    // Recursively process each property
    for (const [key, value] of Object.entries(obj)) {
      newObj[key] = stringifyBigIntObject(value);
    }

    return newObj;
  }

  // Return the value as-is if it's not a BigInt, array, or object
  return obj;
};
