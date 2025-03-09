import type { entity } from '@/consts/entities';
import type {
  Document,
  Organization,
  Project,
  Revision,
  Role,
  User,
  UserWithRoles,
  Workflow,
} from '@/declarations/pt_backend/pt_backend.did';

export type DocumentId = Document['id'];
export type Entity = EntityTypeMap[EntityName];
export type EntityName = keyof typeof entity;
export type OrganizationId = Organization['id'];
export type ProjectId = Project['id'];
export type RevisionId = Revision['id'];
export type RoleId = Role['id'];
export type UserId = User['id'];
export type WorkflowId = Workflow['id'];

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
