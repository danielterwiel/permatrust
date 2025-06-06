import { createCandidVariant } from '@/utils/create-candid-variant';

export const ENTITY = {
  DOCUMENT: 'Document',
  ORGANIZATION: 'Organization',
  PROJECT: 'Project',
  REVISION: 'Revision',
  ROLE: 'Role',
  USER: 'User',
  INVITE: 'Invite',
  WORKFLOW: 'Workflow',
  LOG: 'Log',
} as const;

const entityNames = Object.values(ENTITY);

export const entity = createCandidVariant(entityNames);
