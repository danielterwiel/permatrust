import { createCandidVariant } from '@/utils/create-candid-variant';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

export const DEFAULT_PAGINATION: PaginationInput = {
  filters: [],
  page_number: 1,
  page_size: 10,
  sort: [],
} as const;

const DOCUMENT_FIELD = {
  CREATED_AT: 'CreatedAt',
  PROJECT_ID: 'ProjectId',
  TITLE: 'Title',
  VERSION: 'Version',
} as const;

const ORGANIZATION_FIELD = {
  CREATED_AT: 'CreatedAt',
  CREATED_BY: 'CreatedBy',
  NAME: 'Name',
} as const;

const PROJECT_FIELD = {
  CREATED_AT: 'CreatedAt',
  CREATED_BY: 'CreatedBy',
  MEMBERS: 'Members',
  NAME: 'Name',
  ORGANIZATION_ID: 'OrganizationId',
} as const;

const REVISION_FIELD = {
  CREATED_AT: 'CreatedAt',
  DOCUMENT_ID: 'DocumentId',
  PROJECT_ID: 'ProjectId',
  VERSION: 'Version',
} as const;

const USER_FIELD = {
  FIRST_NAME: 'FirstName',
  ID: 'Id',
  LAST_NAME: 'LastName',
} as const;

const USER_WITH_ROLES_FIELD = {
  FIRST_NAME: 'FirstName',
  LAST_NAME: 'LastName',
} as const;

const WORKFLOW_FIELD = {
  NAME: 'Name',
  PROJECT_ID: 'ProjectId',
} as const;

export const FILTER_SORT_FIELDS = {
  DOCUMENT: {
    CREATED_AT: DOCUMENT_FIELD.CREATED_AT,
    PROJECT_ID: DOCUMENT_FIELD.PROJECT_ID,
    TITLE: DOCUMENT_FIELD.TITLE,
    VERSION: DOCUMENT_FIELD.VERSION,
  },
  ORGANIZATION: {
    CREATED_AT: ORGANIZATION_FIELD.CREATED_AT,
    NAME: ORGANIZATION_FIELD.NAME,
  },
  PROJECT: {
    CREATED_AT: PROJECT_FIELD.CREATED_AT,
    CREATED_BY: PROJECT_FIELD.CREATED_BY,
    NAME: PROJECT_FIELD.NAME,
    ORGANIZATION_ID: PROJECT_FIELD.ORGANIZATION_ID,
  },
  REVISION: {
    CREATED_AT: REVISION_FIELD.CREATED_AT,
    DOCUMENT_ID: REVISION_FIELD.DOCUMENT_ID,
    PROJECT_ID: REVISION_FIELD.PROJECT_ID,
    VERSION: REVISION_FIELD.VERSION,
  },
  USER: {
    FIRST_NAME: USER_FIELD.FIRST_NAME,
    ID: USER_FIELD.ID,
    LAST_NAME: USER_FIELD.LAST_NAME,
  },
  USER_WITH_ROLES: {
    FIRST_NAME: USER_WITH_ROLES_FIELD.FIRST_NAME,
    LAST_NAME: USER_WITH_ROLES_FIELD.LAST_NAME,
  },
  WORKFLOW: {
    NAME: WORKFLOW_FIELD.NAME,
    PROJECT_ID: WORKFLOW_FIELD.PROJECT_ID,
  },
} as const;

export const FILTER_OPERATOR = {
  CONTAINS: 'Contains',
  EQUALS: 'Equals',
  GREATER_THAN: 'GreaterThan',
  LESS_THAN: 'LessThan',
} as const;

export const SORT_ORDER = {
  ASC: 'Asc',
  DESC: 'Desc',
} as const;

const documentFields = createCandidVariant(Object.values(DOCUMENT_FIELD));
const organizationFields = createCandidVariant(
  Object.values(ORGANIZATION_FIELD),
);
const projectFields = createCandidVariant(Object.values(PROJECT_FIELD));
const revisionFields = createCandidVariant(Object.values(REVISION_FIELD));
const userFields = createCandidVariant(Object.values(USER_FIELD));
const userWithRolesFields = createCandidVariant(
  Object.values(USER_WITH_ROLES_FIELD),
);
const workflowFields = createCandidVariant(Object.values(WORKFLOW_FIELD));

export const filterOperator = createCandidVariant(
  Object.values(FILTER_OPERATOR),
);
export const sortOrder = createCandidVariant(Object.values(SORT_ORDER));

export const filterField = {
  Document: documentFields,
  Organization: organizationFields,
  Project: projectFields,
  Revision: revisionFields,
  User: userFields,
  UserWithRoles: userWithRolesFields,
  Workflow: workflowFields,
} as const;
