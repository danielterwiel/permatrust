import { z } from 'zod';

import { createFilter, createSort } from '@/utils/pagination';

import { DEFAULT_PAGINATION } from '@/consts/pagination';

import type {
  DocumentFilterField as ApiDocumentFilterField,
  Entity as ApiEntity,
  FilterCriteria as ApiFilterCriteria,
  FilterField as ApiFilterField,
  FilterOperator as ApiFilterOperator,
  InviteFilterField as ApiInviteFilterField,
  LogFilterField as ApiLogFilterField,
  OrganizationFilterField as ApiOrganizationFilterField,
  PaginationInput as ApiPaginationInput,
  ProjectFilterField as ApiProjectFilterField,
  RevisionFilterField as ApiRevisionFilterField,
  RoleFilterField as ApiRoleFilterField,
  SortCriteria as ApiSortCriteria,
  SortOrder as ApiSortOrder,
  UserFilterField as ApiUserFilterField,
  WorkflowFilterField as ApiWorkflowFilterField,
} from '@/declarations/tenant_canister/tenant_canister.did';
import type { EntityName } from '@/types/entities';
import type { PaginationConfig } from '@/types/pagination';

const organizationFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiOrganizationFilterField>;

const projectFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Name: z.null() }).strict(),
  z.object({ Members: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
  z.object({ CreatedBy: z.null() }).strict(),
]) satisfies z.ZodType<ApiProjectFilterField>;

const documentFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Title: z.null() }).strict(),
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiDocumentFilterField>;

const revisionFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ DocumentId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiRevisionFilterField>;

const userFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserFilterField>;

const inviteFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ CreatedBy: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
  z.object({ AcceptedBy: z.null() }).strict(),
  z.object({ AcceptedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiInviteFilterField>;

const roleFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Name: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiRoleFilterField>;

const workflowFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Name: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
]) satisfies z.ZodType<ApiWorkflowFilterField>;

const logFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ Level: z.null() }).strict(),
  z.object({ Timestamp: z.null() }).strict(),
  z.object({ Message: z.null() }).strict(),
  z.object({ Origin: z.null() }).strict(),
]) satisfies z.ZodType<ApiLogFilterField>;

const entitySchema = z.union([
  z.object({ Document: z.null() }).strict(),
  z.object({ Organization: z.null() }).strict(),
  z.object({ Project: z.null() }).strict(),
  z.object({ Revision: z.null() }).strict(),
  z.object({ Invite: z.null() }).strict(),
  z.object({ User: z.null() }).strict(),
  z.object({ Workflow: z.null() }).strict(),
  z.object({ LogEntry: z.null() }).strict(),
]) satisfies z.ZodType<ApiEntity>;

export const filterFieldSchema = z.union([
  z.object({ Document: documentFieldSchema }).strict(),
  z.object({ Organization: organizationFieldSchema }).strict(),
  z.object({ Project: projectFieldSchema }).strict(),
  z.object({ Revision: revisionFieldSchema }).strict(),
  z.object({ Invite: inviteFieldSchema }).strict(),
  z.object({ Role: roleFieldSchema }).strict(),
  z.object({ User: userFieldSchema }).strict(),
  z.object({ Workflow: workflowFieldSchema }).strict(),
  z.object({ LogEntry: logFieldSchema }).strict(),
]) satisfies z.ZodType<ApiFilterField>;

export const filterOperatorSchema = z.union([
  z.object({ Contains: z.null() }).strict(),
  z.object({ Equals: z.null() }).strict(),
  z.object({ GreaterThan: z.null() }).strict(),
  z.object({ LessThan: z.null() }).strict(),
]) satisfies z.ZodType<ApiFilterOperator>;

const sortOrderSchema = z.union([
  z.object({ Asc: z.null() }).strict(),
  z.object({ Desc: z.null() }).strict(),
]) satisfies z.ZodType<ApiSortOrder>;

export const filterCriteriaSchema = z
  .object({
    entity: entitySchema,
    field: filterFieldSchema,
    operator: filterOperatorSchema,
    value: z.string(),
  })
  .strict() satisfies z.ZodType<ApiFilterCriteria>;

export const sortCriteriaSchema = z
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

export const paginationInputSchema = z
  .object({
    filters: filtersSchema,
    page_number: z.number(),
    page_size: z.number(),
    sort: sortSchema,
  })
  .strict() satisfies z.ZodType<ApiPaginationInput>;

const paginationUrlSchema = z
  .object({
    filters: filtersSchema.optional(),
    page_number: z.number().optional(),
    page_size: z.number().optional(),
    sort: sortSchema.optional(),
  })
  .partial();

// URL search schema for pagination (used in router and components)
export const paginationSearchSchema = z
  .object({
    pagination: paginationUrlSchema.optional(),
  })
  .partial();

// Type for pagination search params
export type PaginationSearchParams = z.infer<typeof paginationSearchSchema>;

/**
 * Creates default pagination input with entity-specific filters and sorting
 */
export function createPagination(
  entityName: EntityName,
  config: PaginationConfig,
): ApiPaginationInput {
  const filters = [
    [
      createFilter({
        entity: entityName,
        field: config.defaultFilterField,
        operator: config.defaultFilterOperator,
        value: config.defaultFilterValue,
      }),
    ],
  ] satisfies [Array<ApiFilterCriteria>];

  const sort = [
    createSort({
      entity: entityName,
      field: config.defaultSortField,
      order: config.defaultSortOrder,
    }),
  ] satisfies [ApiSortCriteria];

  return {
    filters,
    sort,
    page_number: DEFAULT_PAGINATION.page_number,
    page_size: config.pageSize || DEFAULT_PAGINATION.page_size,
  };
}

/**
 * Creates entity-specific search schema with default pagination
 */
export function createPaginationSchema(
  entityName: EntityName,
  config: PaginationConfig,
) {
  const defaultEntityPagination = createPagination(entityName, config);

  const searchSchema = z.object({
    pagination: paginationUrlSchema.optional(),
  });

  return {
    defaultPagination: defaultEntityPagination,
    schema: searchSchema,
  };
}
