import { z } from "zod";

const DocumentField = z.union([
  z.object({ ProjectId: z.null() }),
  z.object({ Title: z.null() }),
  z.object({ CreatedAt: z.null() })
]);

const FilterOperator = z.union([
  z.object({ Contains: z.null() }),
  z.object({ GreaterThan: z.null() }),
  z.object({ LessThan: z.null() }),
  z.object({ Equals: z.null() })
]);

export const FilterCriteriaSchema = z.object({
  field: DocumentField,
  value: z.string(),
  operator: FilterOperator
});

