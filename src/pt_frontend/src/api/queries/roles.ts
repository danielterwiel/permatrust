import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type {
  DocumentIdInput,
  GetProjectRolesInput,
} from '@/declarations/pt_backend/pt_backend.did';

export const getRoleOptions = (input: DocumentIdInput) =>
  createQueryOptions({
    queryFn: () => api.get_role(input),
    queryKey: ['role', input],
  });

export const getProjectRolesOptions = (input: GetProjectRolesInput) =>
  createQueryOptions({
    queryFn: () => api.get_project_roles(input),
    queryKey: ['project_roles', input],
  });