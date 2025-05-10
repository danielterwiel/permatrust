import { createPagination } from '@/schemas/pagination';
import { createQueryOptions } from '@/utils/create-query-options';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { ListUsersInput } from '@/declarations/tenant_canister/tenant_canister.did';
import type { ProjectId } from '@/types/entities';

import { api } from '@/api';

export const getUserOptions = () =>
  createQueryOptions({
    queryFn: api.tenant.get_user,
    queryKey: ['user'],
  });

export const listUsersOptions = (input: ListUsersInput) =>
  createQueryOptions({
    queryFn: () => api.tenant.list_users(input),
    queryKey: ['users', input],
  });

export const listUsersByProjectIdOptions = (projectId: ProjectId) => {
  const pagination = createPagination(ENTITY.USER, {
    defaultFilterField: FIELDS.USER.PROJECT_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: projectId.toString(),
    defaultSortField: FIELDS.USER.LAST_NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

  return createQueryOptions({
    queryFn: () =>
      api.tenant.list_project_members({
        pagination,
      }),
    queryKey: ['users_by_project_id', { projectId, pagination }],
  });
};
