import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  ListProjectsByOrganizationIdInput,
  PaginationInput
} from '@/declarations/pt_backend/pt_backend.did';

export const getProjectQueryOptions = (project_id: number) =>
  queryOptions({
    queryFn: () => api.get_project({ id: project_id }),
    queryKey: ['project', { project_id }],
  });

export const getProjectsQueryOptions = () =>
  queryOptions({
    queryFn: () => api.get_projects(),
    queryKey: ['projects'],
  });

export const listProjectsQueryOptions = (input: PaginationInput) =>
  queryOptions({
    queryFn: () => api.list_projects(input),
    queryKey: ['projects_list', input],
  });

export const listProjectsByOrganizationIdQueryOptions = (input: ListProjectsByOrganizationIdInput) =>
  queryOptions({
    queryFn: () => api.list_projects_by_organization_id(input),
    queryKey: ['projects_by_organization', input],
  });
