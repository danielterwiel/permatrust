import { z } from 'zod';

import { EntitySchema } from './entities';

import type {
  DocumentFilterField as ApiDocumentFilterField,
  FilterCriteria as ApiFilterCriteria,
  FilterField as ApiFilterField,
  FilterOperator as ApiFilterOperator,
  OrganizationFilterField as ApiOrganizationFilterField,
  PaginationInput as ApiPaginationInput,
  ProjectFilterField as ApiProjectFilterField,
  RevisionFilterField as ApiRevisionFilterField,
  SortCriteria as ApiSortCriteria,
  SortOrder as ApiSortOrder,
  UserFilterField as ApiUserFilterField,
  WorkflowFilterField as ApiWorkflowFilterField,
} from '@/declarations/pt_backend/pt_backend.did';

const userFilterFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserFilterField>;
const userWithRolesFilterFieldSchema = z.union([
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserFilterField>;
const organizationFilterFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiOrganizationFilterField>;
const projectFilterFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ OrganizationId: z.null() }).strict(),
  z.object({ Members: z.null() }).strict(),
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
  z.object({ Organization: organizationFilterFieldSchema }).strict(),
  z.object({ Project: projectFilterFieldSchema }).strict(),
  z.object({ Revision: revisionFilterFieldSchema }).strict(),
  z.object({ User: userFilterFieldSchema }).strict(),
  z.object({ UserWithRoles: userWithRolesFilterFieldSchema }).strict(),
  z.object({ Workflow: workflowFilterFieldSchema }).strict(),
]) satisfies z.ZodType<ApiFilterField>;
const filterOperatorSchema = z.union([
  z.object({ Contains: z.null() }).strict(),
  z.object({ GreaterThan: z.null() }).strict(),
  z.object({ LessThan: z.null() }).strict(),
  z.object({ Equals: z.null() }).strict(),
]) satisfies z.ZodType<ApiFilterOperator>;

export const filterCriteriaSchema = z
  .object({
    entity: EntitySchema,
    field: filterFieldSchema,
    operator: filterOperatorSchema,
    value: z.string(),
  })
  .strict() satisfies z.ZodType<ApiFilterCriteria>;

const sortOrderSchema = z.union([
  z.object({ Asc: z.null() }),
  z.object({ Desc: z.null() }),
]) satisfies z.ZodType<ApiSortOrder>;

const sortCriteriaSchema = z
  .object({
    field: filterFieldSchema,
    order: sortOrderSchema,
  })
  .strict() satisfies z.ZodType<ApiSortCriteria>;

const sortSchema = z.union([z.tuple([]), z.tuple([sortCriteriaSchema])]);

const filtersSchema = z.union([
  z.tuple([]),
  z.tuple([z.array(filterCriteriaSchema)]),
]);

export const paginationInputSchema = z.object({
  filters: filtersSchema,
  page_number: z.number(),
  page_size: z.number(),
  sort: sortSchema,
}) satisfies z.ZodType<ApiPaginationInput>;
