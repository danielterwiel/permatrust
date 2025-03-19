import { createPagination } from '@/schemas/pagination';
import { createQueryOptions } from '@/utils/create-query-options';

import { getSingleApiResult } from '../utils/get-single-api-result';

import { ENTITY } from '@/consts/entities';
import {
  FIELDS,
  FILTER_OPERATOR,
  PAGE_SIZE,
  SORT_ORDER,
} from '@/consts/pagination';

import type { ListDocumentsInput } from '@/declarations/pt_backend/pt_backend.did';
import type { DocumentId, ProjectId } from '@/types/entities';

import { api } from '@/api';

export const getDocumentOptions = (id: DocumentId) => {
  const pagination = createPagination(ENTITY.DOCUMENT, {
    defaultFilterField: FIELDS.DOCUMENT.ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: id.toString(),
    defaultSortField: FIELDS.DOCUMENT.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
    pageSize: PAGE_SIZE.SINGLE,
  });

  return createQueryOptions({
    queryFn: async () =>
      getSingleApiResult(
        () => api.list_documents({ pagination }),
        'Document not found',
      ),
    queryKey: ['document', { id }],
  });
};

export const listDocumentsOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.list_documents(input),
    queryKey: ['documents', input],
  });

export const listDocumentsByProjectIdOptions = ({
  projectId,
  pagination: customPagination,
}: {
  projectId: ProjectId;
  pagination?: any;
}) => {
  const defaultPagination = createPagination(ENTITY.DOCUMENT, {
    defaultFilterField: FIELDS.DOCUMENT.PROJECT_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: projectId.toString(),
    defaultSortField: FIELDS.DOCUMENT.VERSION,
    defaultSortOrder: SORT_ORDER.DESC,
  });

  // Use provided pagination or fallback to default
  const pagination = customPagination || defaultPagination;

  return createQueryOptions({
    queryFn: () => api.list_documents({ pagination }),
    queryKey: ['documents_by_project_id', { projectId, pagination }],
  });
};
