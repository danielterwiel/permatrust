import type { FilterFieldName, FilterCriteria } from "@/types/pagination";

export const filterCriteriaToFilterFieldName = (
  filter: FilterCriteria,
): FilterFieldName => {
  const [entityName] = Object.keys(filter.field) as [keyof typeof filter.field];
  if (!entityName) {
    throw new Error("Entity name is undefined");
  }
  const [fieldKey] = Object.keys(filter.field[entityName]);
  if (!fieldKey) {
    throw new Error("Field key is undefined");
  }
  return fieldKey as FilterFieldName;
};
