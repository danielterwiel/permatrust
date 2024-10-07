import type {
  User,
  Project,
  Document,
  Revision,
  Organisation,
} from '@/declarations/pt_backend/pt_backend.did';

export type Entity = User | Organisation | Project | Document | Revision;
