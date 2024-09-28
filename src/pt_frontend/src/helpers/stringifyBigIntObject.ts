import type { TableData } from '@/components/DataTable';

export const stringifyBigIntObject = <T extends TableData | undefined>(
  obj: T
): T => {
  if (!obj) {
    return JSON.parse('[]') as T;
  }

  const replacer = (_key: string, value: unknown) => {
    if (typeof value === 'bigint') {
      return value.toString();
    }
    return value;
  };

  const stringified = JSON.stringify(obj, replacer, 2);
  return JSON.parse(stringified) as T;
};
