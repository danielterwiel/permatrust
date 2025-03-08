import type { entity } from '@/consts/entities';
import type {
  Document,
  Organization,
  Project,
  Revision,
  User,
  UserWithRoles,
  Workflow,
} from '@/declarations/pt_backend/pt_backend.did';

// Union type of all entity types
export type Entity = EntityTypeMap[EntityName];

// Entity type name (string literal union type)
export type EntityName = keyof typeof entity;

// Map entity names to their concrete types
interface EntityTypeMap {
  Document: Document;
  Organization: Organization;
  Project: Project;
  Revision: Revision;
  User: User;
  UserWithRoles: UserWithRoles;
  Workflow: Workflow;
}
