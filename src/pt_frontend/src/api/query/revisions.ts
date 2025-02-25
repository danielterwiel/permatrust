import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  DiffRevisionsInput, 
  DocumentIdInput, 
  ListRevisionsByDocumentIdInput, 
  ListRevisionsInput 
} from '@/declarations/pt_backend/pt_backend.did';

export const getRevisionQueryOptions = (input: DocumentIdInput) =>
  queryOptions({
    queryFn: () => api.get_revision(input),
    queryKey: ['revision', input],
  });

export const getDiffRevisionsQueryOptions = (input: DiffRevisionsInput) =>
  queryOptions({
    queryFn: () => api.get_diff_revisions(input),
    queryKey: ['diff_revisions', input],
  });

export const listRevisionsQueryOptions = (input: ListRevisionsInput) =>
  queryOptions({
    queryFn: () => api.list_revisions(input),
    queryKey: ['revisions', input],
  });

export const listRevisionsByDocumentIdQueryOptions = (input: ListRevisionsByDocumentIdInput) =>
  queryOptions({
    queryFn: () => api.list_revisions_by_document_id(input),
    queryKey: ['revisions_by_document', input],
  });