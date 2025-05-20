import type { entity } from '@/consts/entities';

import type {
  Document,
  Invite,
  Organization,
  Project,
  Revision,
  Role,
  User,
  Workflow,
} from '@/declarations/tenant_canister/tenant_canister.did';

export type DocumentId = Document['id'];
export type Entity = EntityTypeMap[EntityName];
export type ProjectId = Project['id'];
export type InviteId = Invite['id'];
export type RevisionId = Revision['id'];
export type RoleId = Role['id'];
export type UserId = User['id'];
export type WorkflowId = Workflow['id'];

export type EntityName = keyof typeof entity;

// Map entity names to their concrete types
interface EntityTypeMap {
  Document: Document;
  Organization: Organization;
  Project: Project;
  Revision: Revision;
  Role: Role;
  Invite: Invite;
  User: User;
  Workflow: Workflow;
}
