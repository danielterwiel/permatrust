import { buildFilterField } from '@/utils/buildFilterField';
import { snakeToPascalCase } from '@/utils/snakeToPascalCase';

import { SORT_ORDER } from '@/consts/pagination';

import { assertFilterFieldEnum } from './assertFilterFieldEnum';
import { assertFilterFieldName } from './assertFilterFieldName';
import { buildEnum } from './buildEnum';

import type { SortCriteria } from '@/declarations/pt_backend/pt_backend.did';
import type { EntityName } from '@/types/entities';
import type { SortingState } from '@tanstack/react-table';

const columnIdToFilterFieldEnum = (id: string) => {
  const filterFieldNameString = snakeToPascalCase(id);
  const filterFieldName = assertFilterFieldName(filterFieldNameString);
  const filterFieldValueEnum = buildEnum(filterFieldName);
  const filterFieldEnum = assertFilterFieldEnum(filterFieldValueEnum);
  return filterFieldEnum;
};

export const sortingStateToSort = (
  entityName: EntityName,
  sortingStates: SortingState,
): [SortCriteria] => {
  const [sortingState] = sortingStates;
  if (!sortingState) {
    throw new Error('sortingState not found');
  }
  const filterFieldEnum = columnIdToFilterFieldEnum(sortingState.id);
  return [
    {
      field: buildFilterField(entityName, filterFieldEnum),
      order: sortingState?.desc ? SORT_ORDER.Desc : SORT_ORDER.Asc,
    },
  ];
};
