import { createCandidVariant } from '@/utils/create-candid-variant';

// Entity constant definitions - single source of truth
export const ENTITY = {
  DOCUMENT: 'Document',
  ORGANIZATION: 'Organization',
  PROJECT: 'Project',
  REVISION: 'Revision',
  USER: 'User',
  USER_WITH_ROLES: 'UserWithRoles',
  WORKFLOW: 'Workflow',
} as const;

// Preserve existing structures for compatibility
const entityNames = Object.values(ENTITY);

export const entity = createCandidVariant(entityNames);
