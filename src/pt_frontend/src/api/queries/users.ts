import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type {
  ListDocumentsInput,
  ListUsersInput,
} from '@/declarations/pt_backend/pt_backend.did';

export const getUserOptions = () =>
  createQueryOptions({
    queryFn: () => api.get_user(),
    queryKey: ['user'],
  });

export const listUsersOptions = (input: ListUsersInput) =>
  createQueryOptions({
    queryFn: () => api.list_users(input),
    queryKey: ['users', input],
  });

export const listProjectMembersRolesOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.list_project_members_roles(input),
    queryKey: ['project_members_roles', input],
  });
