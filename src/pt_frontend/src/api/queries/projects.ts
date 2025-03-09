import { api } from '@/api';

import { createQueryOptions } from '@/utils/create-query-options';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { OrganizationId } from '@/types/entities';

export const getProjectOptions = (id: number) =>
  createQueryOptions({
    queryFn: () => api.get_project({ id }),
    queryKey: ['project', { id }],
  });

export const listProjectsOptions = (input: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_projects(input),
    queryKey: ['projects_list', input],
  });

export const getProjectsByOrganizationOptions = (
  organizationId: OrganizationId,
  pagination: PaginationInput,
) =>
  createQueryOptions({
    queryFn: () =>
      api.list_projects_by_organization_id({
        organization_id: organizationId,
        pagination,
      }),
    queryKey: [
      'projects_by_organization',
      { organization_id: organizationId, pagination },
    ],
  });
