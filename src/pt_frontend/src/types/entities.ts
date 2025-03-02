import type { ENTITY } from '@/consts/entities';
import type {
  Document,
  Organization,
  Project,
  Revision,
  User,
  UserWithRoles,
  Workflow,
} from '@/declarations/pt_backend/pt_backend.did';

export type Entity =
  | Document
  | Organization
  | Project
  | Revision
  | User
  | UserWithRoles
  | Workflow;
export type EntityName = keyof typeof ENTITY;
