import { createPagination } from '@/schemas/pagination';
import { createQueryOptions } from '@/utils/create-query-options';

import { getSingleApiResult } from '../utils/get-single-api-result';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, PAGE_SIZE, SORT_ORDER } from '@/consts/pagination';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { OrganizationId } from '@/types/entities';

import { api } from '@/api';

export const getOrganizationOptions = (id: OrganizationId) => {
  const pagination = createPagination(ENTITY.ORGANIZATION, {
    defaultFilterField: FIELDS.ORGANIZATION.ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: id.toString(),
    defaultSortField: FIELDS.ORGANIZATION.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
    pageSize: PAGE_SIZE.SINGLE,
  });

  return createQueryOptions({
    queryFn: async () =>
      getSingleApiResult(
        () => api.list_organizations(pagination),
        'Organization not found',
      ),
    queryKey: ['organization', { id }],
  });
};

export const listOrganizationsOptions = (pagination: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_organizations(pagination),
    queryKey: ['organizations', { pagination }],
  });
