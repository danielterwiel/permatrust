import { z } from 'zod';

import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { createFilter, createSort } from '@/utils/pagination';

import type {
  DocumentFilterField as ApiDocumentFilterField,
  Entity as ApiEntity,
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
  UserWithRolesFilterField as ApiUserWithRolesFilterField,
  WorkflowFilterField as ApiWorkflowFilterField,
} from '@/declarations/pt_backend/pt_backend.did';
import type { EntityName } from '@/types/entities';
import type { FilterFieldName, SortOrderName } from '@/types/pagination';

// Document field schema
const documentFieldSchema = z.union([
  z.object({ Title: z.null() }).strict(),
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiDocumentFilterField>;

// Organization field schema
const organizationFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiOrganizationFilterField>;

// Project field schema
const projectFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ OrganizationId: z.null() }).strict(),
  z.object({ Members: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
  z.object({ CreatedBy: z.null() }).strict(),
]) satisfies z.ZodType<ApiProjectFilterField>;

// Revision field schema
const revisionFieldSchema = z.union([
  z.object({ Version: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
  z.object({ DocumentId: z.null() }).strict(),
  z.object({ CreatedAt: z.null() }).strict(),
]) satisfies z.ZodType<ApiRevisionFilterField>;

// User field schema
const userFieldSchema = z.union([
  z.object({ Id: z.null() }).strict(),
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserFilterField>;

// UserWithRoles field schema
const userWithRolesFieldSchema = z.union([
  z.object({ FirstName: z.null() }).strict(),
  z.object({ LastName: z.null() }).strict(),
]) satisfies z.ZodType<ApiUserWithRolesFilterField>;

// Workflow field schema
const workflowFieldSchema = z.union([
  z.object({ Name: z.null() }).strict(),
  z.object({ ProjectId: z.null() }).strict(),
]) satisfies z.ZodType<ApiWorkflowFilterField>;

// Entity schema
const entitySchema = z.union([
  z.object({ Document: z.null() }).strict(),
  z.object({ Organization: z.null() }).strict(),
  z.object({ Project: z.null() }).strict(),
  z.object({ Revision: z.null() }).strict(),
  z.object({ User: z.null() }).strict(),
  z.object({ UserWithRoles: z.null() }).strict(),
  z.object({ Workflow: z.null() }).strict(),
]) satisfies z.ZodType<ApiEntity>;

// Filter field schema
export const filterFieldSchema = z.union([
  z.object({ Document: documentFieldSchema }).strict(),
  z.object({ Organization: organizationFieldSchema }).strict(),
  z.object({ Project: projectFieldSchema }).strict(),
  z.object({ Revision: revisionFieldSchema }).strict(),
  z.object({ User: userFieldSchema }).strict(),
  z.object({ UserWithRoles: userWithRolesFieldSchema }).strict(),
  z.object({ Workflow: workflowFieldSchema }).strict(),
]) satisfies z.ZodType<ApiFilterField>;

// Filter operator schema
export const filterOperatorSchema = z.union([
  z.object({ Contains: z.null() }).strict(),
  z.object({ Equals: z.null() }).strict(),
  z.object({ GreaterThan: z.null() }).strict(),
  z.object({ LessThan: z.null() }).strict(),
]) satisfies z.ZodType<ApiFilterOperator>;

// Sort order schema
const sortOrderSchema = z.union([
  z.object({ Asc: z.null() }).strict(),
  z.object({ Desc: z.null() }).strict(),
]) satisfies z.ZodType<ApiSortOrder>;

// Filter criteria schema
export const filterCriteriaSchema = z
  .object({
    entity: entitySchema,
    field: filterFieldSchema,
    operator: filterOperatorSchema,
    value: z.string(),
  })
  .strict() satisfies z.ZodType<ApiFilterCriteria>;

// Sort criteria schema
export const sortCriteriaSchema = z
  .object({
    field: filterFieldSchema,
    order: sortOrderSchema,
  })
  .strict() satisfies z.ZodType<ApiSortCriteria>;

// Sort schema (empty array or tuple with one sort criteria)
const sortSchema = z.union([z.tuple([]), z.tuple([sortCriteriaSchema])]);

// Filters schema (empty array or tuple with array of filter criteria)
const filtersSchema = z.union([
  z.tuple([]),
  z.tuple([z.array(filterCriteriaSchema)]),
]);

// Pagination input schema
export const paginationInputSchema = z
  .object({
    filters: filtersSchema,
    page_number: z.number(),
    page_size: z.number(),
    sort: sortSchema,
  })
  .strict() satisfies z.ZodType<ApiPaginationInput>;

// For URL search params, create a more lenient version where all fields in the pagination object are optional
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
 * Creates entity-specific search schema with default pagination
 */
interface EntityPaginationConfig {
  defaultFilterField: FilterFieldName;
  defaultFilterOperator: 'Contains' | 'Equals' | 'GreaterThan' | 'LessThan';
  defaultFilterValue: string;
  defaultSortField: FilterFieldName;
  defaultSortOrder: SortOrderName;
}

export function createEntityPaginationSchema(
  entityName: EntityName,
  config: EntityPaginationConfig,
) {
  // Create default filter
  const defaultFilters = [
    [
      createFilter({
        entity: entityName,
        field: config.defaultFilterField,
        operator: config.defaultFilterOperator,
        value: config.defaultFilterValue,
      }),
    ],
  ] satisfies [Array<ApiFilterCriteria>];

  // Create default sort
  const defaultSort = [
    createSort({
      entity: entityName,
      field: config.defaultSortField,
      order: config.defaultSortOrder,
    }),
  ] satisfies [ApiSortCriteria];

  // Create default pagination
  const defaultEntityPagination = {
    filters: defaultFilters,
    page_number: DEFAULT_PAGINATION.page_number,
    page_size: DEFAULT_PAGINATION.page_size,
    sort: defaultSort,
  } satisfies ApiPaginationInput;

  // Create the schema - use the lenient URL schema for validating search params
  const searchSchema = z.object({
    pagination: paginationUrlSchema.optional(),
  });

  return {
    defaultPagination: defaultEntityPagination,
    schema: searchSchema,
  };
}
