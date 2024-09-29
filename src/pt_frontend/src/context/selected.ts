import type {
  Project,
  Document,
  Revision,
} from "@/declarations/pt_backend/pt_backend.did";

export type Auth = {
  projects: Project;
  documents: Document;
  revision: Revision;
};
