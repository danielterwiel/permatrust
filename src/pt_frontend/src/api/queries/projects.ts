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

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { OrganizationId, ProjectId } from '@/types/entities';

import { api } from '@/api';

export const getProjectOptions = (id: ProjectId) => {
  const pagination = createPagination(ENTITY.PROJECT, {
    defaultFilterField: FIELDS.PROJECT.ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: id.toString(),
    defaultSortField: FIELDS.PROJECT.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
    pageSize: PAGE_SIZE.SINGLE,
  });

  return createQueryOptions({
    queryFn: async () =>
      getSingleApiResult(
        () => api.list_projects(pagination),
        'Project not found',
      ),
    queryKey: ['project', { id }],
  });
};

export const listProjectsOptions = (input: { pagination: PaginationInput }) =>
  createQueryOptions({
    queryFn: () => api.list_projects(input.pagination),
    queryKey: ['projects', input],
  });

export const listProjectsByOrganizationIdOptions = (
  organizationId: OrganizationId,
) => {
  const pagination = createPagination(ENTITY.PROJECT, {
    defaultFilterField: FIELDS.PROJECT.ORGANIZATION_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: organizationId.toString(),
    defaultSortField: FIELDS.PROJECT.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

  return createQueryOptions({
    queryFn: () => api.list_projects(pagination),
    queryKey: ['projects_by_organization_id', { organizationId, pagination }],
  });
};
