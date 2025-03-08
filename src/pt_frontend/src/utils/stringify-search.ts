import qs from 'qs';

export function stringifySearch<T extends Record<string, unknown>>(
  search: T,
): string {
  const searchString = qs.stringify(search, {
    allowDots: true,
    strictNullHandling: true,
    arrayFormat: 'indices',
    allowEmptyArrays: true,
    encode: false,
  });

  return searchString ? `?${searchString}` : '';
}
