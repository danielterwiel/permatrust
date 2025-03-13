import { createQueryOptions } from '@/utils/create-query-options';

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

export const getProjectMembersOptions = (
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

export const getProjectMembersRolesOptions = (
  projectId: number,
  pagination: PaginationInput,
) =>
  createQueryOptions({
    queryFn: () =>
      api.list_project_members_roles({
        pagination,
        project_id: projectId,
      }),
    queryKey: ['project_members_roles', { pagination, project_id: projectId }],
  });
