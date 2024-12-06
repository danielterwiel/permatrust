import type { ENTITY } from "@/consts/entities";
import type {
  Document,
  Organization,
  Project,
  Revision,
  User,
  Workflow,
} from "@/declarations/pt_backend/pt_backend.did";

export type Entity =
  | Document
  | Organization
  | Project
  | Revision
  | User
  | Workflow;
export type EntityEnum = (typeof ENTITY)[EntityName];
export type EntityName = keyof typeof ENTITY;
