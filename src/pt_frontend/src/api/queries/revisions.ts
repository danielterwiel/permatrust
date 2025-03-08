import { api } from '@/api';

import { createQueryOptions } from '@/utils/create-query-options';

import type {
  DiffRevisionsInput,
  PaginationInput,
} from '@/declarations/pt_backend/pt_backend.did';

export const getRevisionOptions = (revisionId: bigint) =>
  createQueryOptions({
    queryFn: () => api.get_revision({ id: revisionId }),
    queryKey: ['revision', { id: revisionId }],
  });

export const getRevisionsByDocumentIdOptions = (
  documentId: bigint,
  pagination: PaginationInput,
) =>
  createQueryOptions({
    queryFn: () =>
      api.list_revisions_by_document_id({
        document_id: documentId,
        pagination,
      }),
    queryKey: [
      'revisions_by_document',
      { document_id: documentId, pagination },
    ],
  });

export const getDiffRevisionsOptions = (input: DiffRevisionsInput) =>
  createQueryOptions({
    queryFn: () => api.get_diff_revisions(input),
    queryKey: ['diff_revisions', input],
  });
