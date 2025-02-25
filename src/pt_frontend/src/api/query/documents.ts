import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { ListDocumentsInput } from '@/declarations/pt_backend/pt_backend.did';

export const getDocumentQueryOptions = (id: bigint) =>
  queryOptions({
    queryFn: () => api.get_document({ id }),
    queryKey: ['document', { id }],
  });

export const listDocumentsQueryOptions = (input: ListDocumentsInput) =>
  queryOptions({
    queryFn: () => api.list_documents(input),
    queryKey: ['documents', input],
  });

export const listDocumentsByProjectIdQueryOptions = (input: ListDocumentsInput) =>
  queryOptions({
    queryFn: () => api.list_documents_by_project_id(input),
    queryKey: ['documents_by_project', input],
  });