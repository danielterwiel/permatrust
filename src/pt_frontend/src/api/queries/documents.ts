import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type { ListDocumentsInput } from '@/declarations/pt_backend/pt_backend.did';

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
