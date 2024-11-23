import { FILTER_FIELD } from '@/consts/pagination';

import type { EntityName } from '@/types/entities';
import type { FilterField } from '@/types/pagination';

export function buildFilterField(
  entity: EntityName,
  fieldEnum: Record<string, null>,
): FilterField {
  const validFields = Object.values(FILTER_FIELD[entity]);
  // TODO: isValidField should be simplified. Like this:
  // const isValidField = validFields.includes(fieldEnum);

  const isValidField = validFields.some((field) => {
    const [fieldName] = Object.keys(field);
    const [enumName] = Object.keys(fieldEnum);
    return fieldName === enumName;
  });

  if (!isValidField) {
    throw new Error(`Field enum does not match entity ${entity}`);
  }

  const filterField = {
    [entity]: fieldEnum,
  };

  return filterField as FilterField;
}
