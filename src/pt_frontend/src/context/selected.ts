import type {
  Project,
  Document,
  DocumentRevision,
} from "@/declarations/pt_backend/pt_backend.did";

export type Selected = {
  project?: Project;
  document?: Document;
  revision?: DocumentRevision;
};

export const selected: Selected = {
  project: undefined,
  document: undefined,
  revision: undefined,
};
