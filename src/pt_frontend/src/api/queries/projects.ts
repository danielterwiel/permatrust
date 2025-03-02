import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

export const getProjectOptions = (id: number) =>
  createQueryOptions({
    queryFn: () => api.get_project({ id }),
    queryKey: ['project', { id }],
  });

export const getProjectsOptions = () =>
  createQueryOptions({
    queryFn: () => api.get_projects(),
    queryKey: ['projects'],
  });

export const listProjectsOptions = (input: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_projects(input),
    queryKey: ['projects_list', input],
  });

export const getProjectsByOrganizationOptions = (
  organizationId: number,
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
