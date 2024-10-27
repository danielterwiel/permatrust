import type { ENTITY } from "@/consts/entities";
import type {
  Document,
  Organisation,
  Project,
  Revision,
  User,
  Workflow,
} from "@/declarations/pt_backend/pt_backend.did";

export type Entity =
  | Document
  | Organisation
  | Project
  | Revision
  | User
  | Workflow;
export type EntityName = keyof typeof ENTITY;
