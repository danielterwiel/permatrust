import qs from 'qs';

export function parseSearch<T extends Record<string, unknown>>(
  search: string,
): T {
  const parsed = qs.parse(search, {
    allowDots: true,
    strictNullHandling: true,
    ignoreQueryPrefix: true,
    plainObjects: true,
    depth: 10,
  });

  return deepParse(parsed) as T;
}

function deepParse(obj: unknown): unknown {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    // Convert to number if numeric
    if (/^-?\d+(\.\d+)?$/.test(obj)) {
      return Number(obj);
    }
    // Convert to boolean if true/false
    if (obj === 'true') return true;
    if (obj === 'false') return false;
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => deepParse(item));
  }

  if (typeof obj === 'object') {
    const result: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        const typedObj = obj as Record<string, unknown>;
        result[key] = deepParse(typedObj[key]);
      }
    }
    return result;
  }

  return obj;
}
