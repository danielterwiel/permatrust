import type { FILTER_FIELD } from '@/consts/pagination';
import type {
  filterCriteriaSchema,
  filterFieldSchema,
} from '@/schemas/pagination';
import type { EntityName } from '@/types/entities';
import type { z } from 'zod';

export type FilterCriteria = z.infer<typeof filterCriteriaSchema>;
export type FilterField = z.infer<typeof filterFieldSchema>;
export type FilterFieldEnum = {
  [E in EntityName]: FilterFields[E][keyof FilterFields[E]];
}[EntityName];
export type FilterFieldName = FilterFieldNames[keyof FilterFieldNames];
type FilterFieldNames = {
  [E in EntityName]: keyof FilterFields[E];
};
type FilterFields = typeof FILTER_FIELD;
