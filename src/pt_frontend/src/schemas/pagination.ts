import { z } from 'zod';

import { entitySchema } from './entities';

import type {
  DocumentFilterField as ApiDocumentFilterField,
  FilterField as ApiFilterField,
  FilterOperator as ApiFilterOperator,
  Filters as ApiFilters,
  OrganisationFilterField as ApiOrganisationFilterField,
  PaginationInput as ApiPaginationInput,
  ProjectFilterField as ApiProjectFilterField,
  RevisionFilterField as ApiRevisionFilterField,
  Sort as ApiSort,
  SortOrder as ApiSortOrder,
  UserFilterField as ApiUserFilterField,
  WorkflowFilterField as ApiWorkflowFilterField,
} from '@/declarations/pt_backend/pt_backend.did';

const userFilterFieldSchema = z.union([
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserFilterField>;
const organisationFilterFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiOrganisationFilterField>;
const projectFilterFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ OrganisationId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
  z.object({ CreatedBy: z.null() }).strict(),
]) satisfies z.ZodType<ApiProjectFilterField>;
const documentFilterFieldSchema = z.union([
  z.object({ Title: z.null() }).strict(),
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiDocumentFilterField>;
const revisionFilterFieldSchema = z.union([
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ DocumentId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiRevisionFilterField>;
const workflowFilterFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
]) satisfies z.ZodType<ApiWorkflowFilterField>;
export const filterFieldSchema = z.union([
  z.object({ Document: documentFilterFieldSchema }).strict(),
  z.object({ Organisation: organisationFilterFieldSchema }).strict(),
  z.object({ Project: projectFilterFieldSchema }).strict(),
  z.object({ Revision: revisionFilterFieldSchema }).strict(),
  z.object({ User: userFilterFieldSchema }).strict(),
  z.object({ Workflow: workflowFilterFieldSchema }).strict(),
]) satisfies z.ZodType<ApiFilterField>;
export const filterOperatorSchema = z.union([
  z.object({ Contains: z.null() }).strict(),
  z.object({ GreaterThan: z.null() }).strict(),
  z.object({ LessThan: z.null() }).strict(),
  z.object({ Equals: z.null() }).strict(),
]) satisfies z.ZodType<ApiFilterOperator>;

export const filterCriteriaSchema = z
  .object({
    entity: entitySchema,
    field: filterFieldSchema,
    operator: filterOperatorSchema,
    value: z.string(),
  })
  .strict();

const sortOrderSchema = z.union([
  z.object({ Asc: z.null() }),
  z.object({ Desc: z.null() }),
]) satisfies z.ZodType<ApiSortOrder>;

export const sortSchema = z.union([
  z.tuple([]),
  z.tuple([
    z.object({
      field: filterFieldSchema,
      order: sortOrderSchema,
    }),
  ]),
]) satisfies z.ZodType<ApiSort>;

export const filtersSchema = z.union([
  z.tuple([]),
  z.tuple([z.array(filterCriteriaSchema)]),
]) satisfies z.ZodType<ApiFilters>;

export const paginationInputSchema = z.object({
  filters: filtersSchema,
  page_number: z.number(),
  page_size: z.number(),
  sort: sortSchema,
}) satisfies z.ZodType<ApiPaginationInput>;
