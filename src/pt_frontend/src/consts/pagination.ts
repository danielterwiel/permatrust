import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { FilterFieldEnum, FilterFieldName } from '@/types/pagination';

export const DEFAULT_PAGINATION: PaginationInput = {
  filters: [],
  page_number: 1,
  page_size: 10,
  sort: [],
} as const;
export const FILTER_FIELD_DOCUMENT = {
  CreatedAt: { CreatedAt: null },
  ProjectId: { ProjectId: null },
  Title: { Title: null },
  Version: { Version: null },
} as const;
export const FILTER_FIELD_ORGANISATION = {
  CreatedAt: { CreatedAt: null },
  CreatedBy: { CreatedBy: null },
  Name: { Name: null },
} as const;
export const FILTER_FIELD_PROJECT = {
  CreatedAt: { CreatedAt: null },
  CreatedBy: { CreatedBy: null },
  Name: { Name: null },
  OrganisationId: { OrganisationId: null },
} as const;
export const FILTER_FIELD_REVISION = {
  CreatedAt: { CreatedAt: null },
  DocumentId: { DocumentId: null },
  ProjectId: { ProjectId: null },
  Version: { Version: null },
} as const;
export const FILTER_FIELD_USER = {
  FirstName: { FirstName: null },
  LastName: { LastName: null },
} as const;
export const FILTER_FIELD_WORKFLOW = {
  Name: { Name: null },
  ProjectId: { ProjectId: null },
} as const;

export const FILTER_FIELD = {
  Document: FILTER_FIELD_DOCUMENT,
  Organisation: FILTER_FIELD_ORGANISATION,
  Project: FILTER_FIELD_PROJECT,
  Revision: FILTER_FIELD_REVISION,
  User: FILTER_FIELD_USER,
  Workflow: FILTER_FIELD_WORKFLOW,
} as const;

export const FILTER_OPERATOR = {
  Contains: { Contains: null },
  Equals: { Equals: null },
  GreaterThan: { GreaterThan: null },
  LessThan: { LessThan: null },
} as const;

export const SORT_ORDER = {
  Asc: { Asc: null },
  Desc: { Desc: null },
} as const;

export const FILTER_FIELD_NAMES = [
  ...new Set(
    Object.values(FILTER_FIELD).flatMap((fields) =>
      Object.keys(fields),
    ) as FilterFieldName[],
  ),
] satisfies FilterFieldName[];

export const FILTER_FIELD_ENUM = [
  ...new Set(
    Object.values(FILTER_FIELD).flatMap((fields) =>
      Object.values(fields),
    ) as FilterFieldEnum[],
  ),
] satisfies FilterFieldEnum[];
