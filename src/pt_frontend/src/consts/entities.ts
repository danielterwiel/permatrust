import type {
  Workflow,
  User,
  Project,
  Document,
  Revision,
  Organisation,
} from '@/declarations/pt_backend/pt_backend.did';

export type Entity =
  | User
  | Workflow
  | Organisation
  | Project
  | Document
  | Revision;
