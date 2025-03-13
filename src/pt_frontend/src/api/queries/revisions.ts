import { api } from '@/api';
import { createQueryOptions } from '@/utils/create-query-options';

import type {
  DiffRevisionsInput,
  PaginationInput,
} from '@/declarations/pt_backend/pt_backend.did';
import type { DocumentId, RevisionId } from '@/types/entities';

export const getRevisionOptions = (id: RevisionId) =>
  createQueryOptions({
    queryFn: () => api.get_revision({ id }),
    queryKey: ['revision', { id }],
  });

export const getRevisionsByDocumentIdOptions = (
  document_id: DocumentId,
  pagination: PaginationInput,
) => {
  return createQueryOptions({
    queryFn: () =>
      api.list_revisions_by_document_id({
        document_id,
        pagination,
      }),
    queryKey: ['revisions_by_document_id', { document_id, pagination }],
  });
};

export const getDiffRevisionsOptions = (input: DiffRevisionsInput) =>
  createQueryOptions({
    queryFn: () => api.get_diff_revisions(input),
    queryKey: ['diff_revisions', input],
  });
