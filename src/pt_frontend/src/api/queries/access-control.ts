import { createQueryOptions } from '@/utils/create-query-options';

import type { ProjectId } from '@/types/entities';

import { api } from '@/api';

export const getPermissionsOptions = () =>
  createQueryOptions({
    queryFn: () => api.tenant.get_permissions(),
    queryKey: ['permissions'],
  });

export const getProjectRolesOptions = (project_id: ProjectId) =>
  createQueryOptions({
    queryFn: () => api.tenant.get_project_roles({ project_id }),
    queryKey: ['project_roles', { project_id }],
  });
