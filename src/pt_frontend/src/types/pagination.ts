import type { z } from "zod";
import type {
  filterCriteriaSchema,
  filterFieldSchema,
} from "@/schemas/pagination";
import type { FILTER_FIELD } from "@/consts/pagination";

export type FilterCriteria = z.infer<typeof filterCriteriaSchema>;
export type FilterField = z.infer<typeof filterFieldSchema>;
export type FilterFieldName = {
  [K in keyof typeof FILTER_FIELD]: keyof (typeof FILTER_FIELD)[K];
}[keyof typeof FILTER_FIELD];
export type FilterFieldEnum = {
  [K in FilterFieldName]: { [P in K]: null };
}[FilterFieldName];
