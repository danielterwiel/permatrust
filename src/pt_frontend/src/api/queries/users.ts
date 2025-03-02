import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type {
  ListDocumentsInput,
  ListUsersInput,
  UserIdInput,
} from '@/declarations/pt_backend/pt_backend.did';

export const getUserOptions = () =>
  createQueryOptions({
    queryFn: () => api.get_user(),
    queryKey: ['user'],
  });

export const getUserRolesOptions = (input: UserIdInput) =>
  createQueryOptions({
    queryFn: () => api.get_user_roles(input),
    queryKey: ['user_roles', input],
  });

export const getUserPermissionsOptions = (input: UserIdInput) =>
  createQueryOptions({
    queryFn: () => api.get_user_permissions(input),
    queryKey: ['user_permissions', input],
  });

export const listUsersOptions = (input: ListUsersInput) =>
  createQueryOptions({
    queryFn: () => api.list_users(input),
    queryKey: ['users', input],
  });

export const listProjectMembersOptions = (input: ListDocumentsInput) =>
  createQueryOptions({
    queryFn: () => api.list_project_members(input),
    queryKey: ['project_members', input],
  });

export const listProjectMembersRolesOptions = (
  input: ListDocumentsInput,
) =>
  createQueryOptions({
    queryFn: () => api.list_project_members_roles(input),
    queryKey: ['project_members_roles', input],
  });