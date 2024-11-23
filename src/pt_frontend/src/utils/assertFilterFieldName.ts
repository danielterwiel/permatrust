import { FILTER_FIELD_NAMES } from '@/consts/pagination';

import type { FilterFieldName } from '@/types/pagination';

const isFilterFieldName = (value: string): value is FilterFieldName =>
  FILTER_FIELD_NAMES.includes(value as FilterFieldName);

export function assertFilterFieldName(value: string): FilterFieldName {
  if (isFilterFieldName(value)) {
    return value;
  }
  throw new Error(
    `Invalid filter field name: "${value}". Expected one of: ${FILTER_FIELD_NAMES.join(
      ', ',
    )}`,
  );
}
