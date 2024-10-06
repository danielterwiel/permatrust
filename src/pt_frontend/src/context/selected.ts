import type {
  Project,
  Document,
  Revision,
  Organisation,
} from '@/declarations/pt_backend/pt_backend.did';

export type Selected = {
  organisations: Organisation;
  projects: Project;
  documents: Document;
  revision: Revision;
};
