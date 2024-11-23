import { assertFilterFieldEnum } from '@/utils/assertFilterFieldEnum';
import { assertFilterFieldName } from '@/utils/assertFilterFieldName';
import { buildEnum } from '@/utils/buildEnum';
import { snakeToPascalCase } from '@/utils/snakeToPascalCase';

import type { FilterFieldEnum } from '@/types/pagination';

export const columnIdToFilterFieldEnum = (id: string): FilterFieldEnum => {
  const filterFieldNameString = snakeToPascalCase(id);
  const filterFieldName = assertFilterFieldName(filterFieldNameString);
  const filterFieldValueEnum = buildEnum(filterFieldName);
  const filterFieldEnum = assertFilterFieldEnum(filterFieldValueEnum);
  return filterFieldEnum;
};
