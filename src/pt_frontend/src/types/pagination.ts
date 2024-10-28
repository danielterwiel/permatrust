import type { z } from "zod";
import type {
  filterCriteriaSchema,
  filterFieldSchema,
} from "@/schemas/pagination";
import type { FILTER_FIELD } from "@/consts/pagination";
import type { EntityName } from "@/types/entities";

export type FilterFields = typeof FILTER_FIELD;
export type FilterFieldNames = {
  [E in EntityName]: keyof FilterFields[E];
};
export type FilterFieldName = FilterFieldNames[keyof FilterFieldNames];
export type FilterCriteria = z.infer<typeof filterCriteriaSchema>;
export type FilterField = z.infer<typeof filterFieldSchema>;
export type FilterFieldEnum = {
  [E in EntityName]: FilterFields[E][keyof FilterFields[E]];
}[EntityName];
