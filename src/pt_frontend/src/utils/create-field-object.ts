import type { FieldEnum } from '@/types/pagination';

export const createFieldObject = <T extends string>(
  fieldNames: readonly T[],
) => {
  const result = {} as { [K in T]: FieldEnum<K> };

  for (const name of fieldNames) {
    result[name] = { [name]: null } as FieldEnum<typeof name>;
  }

  return result;
};
