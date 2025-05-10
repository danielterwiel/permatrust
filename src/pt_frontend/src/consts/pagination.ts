import { createCandidVariant } from '@/utils/create-candid-variant';

import type { PaginationInput } from '@/declarations/tenant_canister/tenant_canister.did';

export const PAGE_SIZE = {
  SINGLE: 1,
  DEFAULT: 10,
  MEDIUM: 25,
  LARGE: 50,
} as const;

export const DEFAULT_PAGINATION: PaginationInput = {
  filters: [],
  page_number: 1,
  page_size: PAGE_SIZE.DEFAULT,
  sort: [],
} as const;

const DOCUMENT_FIELD = {
  ID: 'Id',
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
  ID: 'Id',
  MEMBERS: 'Members',
  NAME: 'Name',
} as const;

const REVISION_FIELD = {
  CREATED_AT: 'CreatedAt',
  DOCUMENT_ID: 'DocumentId',
  ID: 'Id',
  PROJECT_ID: 'ProjectId',
  VERSION: 'Version',
} as const;

const USER_FIELD = {
  FIRST_NAME: 'FirstName',
  ID: 'Id',
  LAST_NAME: 'LastName',
  PROJECT_ID: 'ProjectId',
} as const;

const ROLE_FIELD = {
  ID: 'Id',
  NAME: 'Name',
  PROJECT_ID: 'ProjectId',
  CREATED_AT: 'CreatedAt',
} as const;

const WORKFLOW_FIELD = {
  ID: 'Id',
  NAME: 'Name',
  PROJECT_ID: 'ProjectId',
} as const;

export const FIELDS = {
  CREATED_AT: DOCUMENT_FIELD.CREATED_AT,
  DOCUMENT: {
    ID: DOCUMENT_FIELD.ID,
    CREATED_AT: DOCUMENT_FIELD.CREATED_AT,
    PROJECT_ID: DOCUMENT_FIELD.PROJECT_ID,
    TITLE: DOCUMENT_FIELD.TITLE,
    VERSION: DOCUMENT_FIELD.VERSION,
  },
  ROLE: {
    ID: ROLE_FIELD.ID,
    NAME: ROLE_FIELD.NAME,
    PROJECT_ID: ROLE_FIELD.PROJECT_ID,
    CREATED_AT: ROLE_FIELD.CREATED_AT,
  },
  ORGANIZATION: {
    CREATED_AT: ORGANIZATION_FIELD.CREATED_AT,
    NAME: ORGANIZATION_FIELD.NAME,
  },
  PROJECT: {
    CREATED_AT: PROJECT_FIELD.CREATED_AT,
    CREATED_BY: PROJECT_FIELD.CREATED_BY,
    ID: PROJECT_FIELD.ID,
    NAME: PROJECT_FIELD.NAME,
  },
  REVISION: {
    CREATED_AT: REVISION_FIELD.CREATED_AT,
    DOCUMENT_ID: REVISION_FIELD.DOCUMENT_ID,
    ID: REVISION_FIELD.ID,
    PROJECT_ID: REVISION_FIELD.PROJECT_ID,
    VERSION: REVISION_FIELD.VERSION,
  },
  USER: {
    FIRST_NAME: USER_FIELD.FIRST_NAME,
    ID: USER_FIELD.ID,
    LAST_NAME: USER_FIELD.LAST_NAME,
    PROJECT_ID: USER_FIELD.PROJECT_ID,
  },
  WORKFLOW: {
    ID: WORKFLOW_FIELD.ID,
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
const workflowFields = createCandidVariant(Object.values(WORKFLOW_FIELD));

export const filterOperator = createCandidVariant(
  Object.values(FILTER_OPERATOR),
);
export const sortOrder = createCandidVariant(Object.values(SORT_ORDER));

// Create variant for Role fields
const roleFields = createCandidVariant(Object.values(ROLE_FIELD));

export const filterField = {
  Document: documentFields,
  Organization: organizationFields,
  Project: projectFields,
  Revision: revisionFields,
  Role: roleFields,
  User: userFields,
  Workflow: workflowFields,
} as const;
