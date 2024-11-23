import { FILTER_FIELD } from '@/consts/pagination';

import type { EntityName } from '@/types/entities';
import type { FilterFieldEnum, FilterFieldName } from '@/types/pagination';

export const buildEnum = (
  filterFieldName: FilterFieldName,
): FilterFieldEnum => {
  for (const entityName in FILTER_FIELD) {
    const fields = FILTER_FIELD[entityName as EntityName];
    if (filterFieldName in fields) {
      return fields[filterFieldName as keyof typeof fields];
    }
  }
  throw new Error(
    `FilterFieldName ${filterFieldName} not found in FILTER_FIELD`,
  );
};
