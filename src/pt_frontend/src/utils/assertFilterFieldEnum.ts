import { FILTER_FIELD_ENUM } from '@/consts/pagination';

import type { FilterFieldEnum, FilterFieldName } from '@/types/pagination';

const isFilterFieldEnum = (value: {
  [key: string]: null;
}): value is FilterFieldEnum => {
  return FILTER_FIELD_ENUM.some(
    (enumValue) =>
      Object.keys(enumValue).length === 1 &&
      Object.keys(value).length === 1 &&
      Object.keys(enumValue)[0] === Object.keys(value)[0],
  );
};

export function assertFilterFieldEnum(value: FilterFieldEnum): FilterFieldEnum {
  if (isFilterFieldEnum(value)) {
    return value;
  }

  throw new Error(
    `Invalid filter field name: "${value}". Expected one of: ${FILTER_FIELD_ENUM.join(
      ', ',
    )}`,
  );
}
