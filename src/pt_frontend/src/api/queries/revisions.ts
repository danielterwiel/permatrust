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

import type { DiffRevisionsInput } from '@/declarations/tenant_canister/tenant_canister.did';
import type { DocumentId, RevisionId } from '@/types/entities';

import { api } from '@/api';

export const getRevisionOptions = (id: RevisionId) => {
  const pagination = createPagination(ENTITY.REVISION, {
    defaultFilterField: FIELDS.REVISION.ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: id.toString(),
    defaultSortField: FIELDS.REVISION.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
    pageSize: PAGE_SIZE.SINGLE,
  });

  return createQueryOptions({
    queryFn: async () =>
      getSingleApiResult(
        () => api.tenant.list_revisions({ pagination }),
        'Revision not found',
      ),
    queryKey: ['revision', { id }],
  });
};

export const listRevisionsByDocumentIdOptions = (documentId: DocumentId) => {
  const pagination = createPagination(ENTITY.REVISION, {
    defaultFilterField: FIELDS.REVISION.DOCUMENT_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: documentId.toString(),
    defaultSortField: FIELDS.REVISION.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
    pageSize: PAGE_SIZE.DEFAULT,
  });

  return createQueryOptions({
    queryFn: () => api.tenant.list_revisions({ pagination }),
    queryKey: ['revisions', { documentId, pagination }],
  });
};

export const getDiffRevisionsOptions = (input: DiffRevisionsInput) =>
  createQueryOptions({
    queryFn: () => api.tenant.get_diff_revisions(input),
    queryKey: ['diff_revisions', input],
  });
