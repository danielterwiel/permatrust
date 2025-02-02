import type { EntityName } from '@/types/entities';

export const ENTITY = {
  Document: { Document: null },
  Organization: { Organization: null },
  Project: { Project: null },
  Revision: { Revision: null },
  User: { User: null },
  UserWithRoles: { UserWithRoles: null },
  Workflow: { Workflow: null },
} as const;

export const ENTITY_NAME = Object.fromEntries(
  (Object.keys(ENTITY) as EntityName[]).map((key) => [key, key]),
) as Record<EntityName, EntityName>;
