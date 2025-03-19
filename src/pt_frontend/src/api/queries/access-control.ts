import { createPagination } from '@/schemas/pagination';
import { createQueryOptions } from '@/utils/create-query-options';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { ProjectId } from '@/types/entities';

import { api } from '@/api';

export const getPermissionsOptions = () =>
  createQueryOptions({
    queryFn: () => api.get_permissions(),
    queryKey: ['permissions'],
  });

export const getProjectRolesOptions = (project_id: ProjectId) =>
  createQueryOptions({
    queryFn: () => api.get_project_roles({ project_id }),
    queryKey: ['project_roles', { project_id }],
  });

export const listProjectMembersOptions = (
  projectId: number,
  pagination: PaginationInput,
) =>
  createQueryOptions({
    queryFn: () =>
      api.list_project_members({
        pagination,
        project_id: projectId,
      }),
    queryKey: ['project_members', { pagination, project_id: projectId }],
  });

export const listUserWithRolesByProjectIdOptions = (projectId: ProjectId) => {
  const pagination = createPagination(ENTITY.USER_WITH_ROLES, {
    defaultFilterField: FIELDS.USER_WITH_ROLES.PROJECT_ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: projectId.toString(),
    defaultSortField: FIELDS.USER_WITH_ROLES.LAST_NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

  return createQueryOptions({
    queryFn: () =>
      api.list_project_members_roles({
        pagination,
        project_id: projectId,
      }),
    queryKey: ['user_with_roles_by_project', { projectId, pagination }],
  });
};
