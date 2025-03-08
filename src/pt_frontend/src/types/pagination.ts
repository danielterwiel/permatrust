import type {
  filterField,
  filterOperator,
  sortOrder,
} from '@/consts/pagination';
import type {
  filterCriteriaSchema,
  filterFieldSchema,
  paginationInputSchema,
  sortCriteriaSchema,
} from '@/schemas/pagination';
import type { EntityName } from '@/types/entities';
import type { z } from 'zod';

export type FieldEnum<T extends string> = { [K in T]: null };
export type FilterCriteria = z.infer<typeof filterCriteriaSchema>;

export type FilterCriteriaInput = {
  entity: EntityName;
  field: FilterFieldName;
  operator: FilterOperatorName;
  value: string;
};
export type FilterField = z.infer<typeof filterFieldSchema>;

export type FilterFieldEnum = {
  [E in EntityName]: FilterFields[E][keyof FilterFields[E]];
}[EntityName];

export type FilterFieldName = {
  [E in EntityName]: keyof FilterFields[E];
}[EntityName];
export type FilterOperatorName = keyof FilterOperators;
export type PaginationInput = z.infer<typeof paginationInputSchema>;
export type SortCriteria = z.infer<typeof sortCriteriaSchema>;

export type SortCriteriaInput = {
  entity: EntityName;
  field: FilterFieldName;
  order: SortOrderName;
};

export type SortOrderName = keyof SortOrders;

type FilterFields = typeof filterField;

type FilterOperators = typeof filterOperator;

type SortOrders = typeof sortOrder;
