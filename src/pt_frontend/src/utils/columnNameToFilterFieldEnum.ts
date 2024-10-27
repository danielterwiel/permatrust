import { snakeToPascalCase } from '@/utils/snakeToPascalCase';
import { assertFilterFieldName } from '@/utils/assertFilterFieldName';
import { assertFilterFieldEnum } from '@/utils/assertFilterFieldEnum';
import { buildEnum } from '@/utils/buildEnum';
import type { FilterFieldEnum } from '@/types/pagination';

export const columnIdToFilterFieldEnum = (id: string): FilterFieldEnum => {
  const filterFieldNameString = snakeToPascalCase(id);
  const filterFieldName = assertFilterFieldName(filterFieldNameString);
  const filterFieldValueEnum = buildEnum(filterFieldName);
  const filterFieldEnum = assertFilterFieldEnum(filterFieldValueEnum);
  return filterFieldEnum;
};
