import { createQueryOptions } from '@/utils/create-query-options';

import type { ListDocumentsInput } from '@/declarations/pt_backend/pt_backend.did';
import type { DocumentId } from '@/types/entities';

import { api } from '@/api';

export const listDocumentsOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.list_documents(input),
    queryKey: ['documents', input],
  });

export const listDocumentsByProjectIdOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.list_documents_by_project_id(input),
    queryKey: ['documents_by_project', input],
  });

export const getDocumentOptions = (id: DocumentId) =>
  createQueryOptions({
    queryFn: () => api.get_document({ id }),
    queryKey: ['document', { id }],
  });
