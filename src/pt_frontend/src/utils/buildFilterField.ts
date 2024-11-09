import type { EntityName } from '@/types/entities';
import { FILTER_FIELD } from '@/consts/pagination';
import type { FilterFields, FilterField } from '@/types/pagination';

export function buildFilterField(
  entity: EntityName,
  fieldEnum: Record<string, null>,
): FilterField {
  const validFields = Object.values(FILTER_FIELD[entity]);
  const isValidField = validFields.includes(fieldEnum);

  if (!isValidField) {
    throw new Error(`Field enum does not match entity ${entity}`);
  }

  const filterField = {
    [entity]: fieldEnum,
  };

  return filterField as FilterField;
}
