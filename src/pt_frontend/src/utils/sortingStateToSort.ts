import { SORT_ORDER } from "@/consts/pagination";
import { snakeToPascalCase } from "@/utils/snakeToPascalCase";
import { assertFilterFieldName } from "./assertFilterFieldName";
import { assertFilterFieldEnum } from "./assertFilterFieldEnum";
import { buildFilterField } from "@/utils/buildFilterField";

import type { EntityName } from "@/types/entities";
import type { Sort } from "@/declarations/pt_backend/pt_backend.did";
import type { SortingState } from "@tanstack/react-table";
import { buildEnum } from "./buildEnum";

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
): Sort => {
  const [sortingState] = sortingStates;
  if (!sortingState) {
    throw new Error("sortingState not found");
  }
  const filterFieldEnum = columnIdToFilterFieldEnum(sortingState.id);
  return [
    {
      field: buildFilterField(entityName, filterFieldEnum),
      order: sortingState?.desc ? SORT_ORDER.Desc : SORT_ORDER.Asc,
    },
  ];
};
