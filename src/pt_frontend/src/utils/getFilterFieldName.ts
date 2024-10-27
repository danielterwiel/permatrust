import type { FilterFieldEnum, FilterFieldName } from "@/types/pagination";

export function getFilterFieldName(
  filterField: FilterFieldEnum,
): FilterFieldName {
  const [filterFieldName] = Object.keys(filterField) as [FilterFieldName];
  return filterFieldName;
}
