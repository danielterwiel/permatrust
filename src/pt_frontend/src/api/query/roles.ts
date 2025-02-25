import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  DocumentIdInput, 
  GetProjectRolesInput 
} from '@/declarations/pt_backend/pt_backend.did';

export const getRoleQueryOptions = (input: DocumentIdInput) =>
  queryOptions({
    queryFn: () => api.get_role(input),
    queryKey: ['role', input],
  });

export const getProjectRolesQueryOptions = (input: GetProjectRolesInput) =>
  queryOptions({
    queryFn: () => api.get_project_roles(input),
    queryKey: ['project_roles', input],
  });

export const getPermissionsQueryOptions = () =>
  queryOptions({
    queryFn: () => api.get_permissions(),
    queryKey: ['permissions'],
  });