import type { EntityName } from '@/types/entities';
import type { FilterField, FilterFieldEnum } from '@/types/pagination';
import { getFilterFieldName } from './getFilterFieldName';
import { buildEnum } from './buildEnum';

export function buildFilterField<
  E extends EntityName,
  F extends FilterFieldEnum,
>(entity: E, field: F): FilterField {
  const fieldName = getFilterFieldName(field);
  const filterField = {
    [entity]: buildEnum(fieldName),
  };
  return filterField as FilterField;
}
