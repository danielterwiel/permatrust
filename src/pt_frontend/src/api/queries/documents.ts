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

import type { ListDocumentsInput } from '@/declarations/tenant_canister/tenant_canister.did';
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
        () => api.tenant.list_documents({ pagination }),
        'Document not found',
      ),
    queryKey: ['document', { id }],
  });
};

export const listDocumentsOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.tenant.list_documents(input),
    queryKey: ['documents', input],
  });

export const listDocumentsByProjectIdOptions = (projectId: ProjectId) => {
  const pagination = createPagination(ENTITY.DOCUMENT, {
    defaultFilterField: FIELDS.DOCUMENT.PROJECT_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: projectId.toString(),
    defaultSortField: FIELDS.DOCUMENT.VERSION,
    defaultSortOrder: SORT_ORDER.DESC,
  });

  return createQueryOptions({
    queryFn: () => api.tenant.list_documents({ pagination }),
    queryKey: ['documents_by_project_id', { projectId, pagination }],
  });
};
