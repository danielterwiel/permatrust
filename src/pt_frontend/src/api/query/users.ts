import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { ListDocumentsInput, ListUsersInput, UserIdInput } from '@/declarations/pt_backend/pt_backend.did';

export const getUserQueryOptions = () =>
  queryOptions({
    queryFn: () => api.get_user(),
    queryKey: ['user'],
  });

export const getUserRolesQueryOptions = (input: UserIdInput) =>
  queryOptions({
    queryFn: () => api.get_user_roles(input),
    queryKey: ['user_roles', input],
  });

export const getUserPermissionsQueryOptions = (input: UserIdInput) =>
  queryOptions({
    queryFn: () => api.get_user_permissions(input),
    queryKey: ['user_permissions', input],
  });

export const listUsersQueryOptions = (input: ListUsersInput) =>
  queryOptions({
    queryFn: () => api.list_users(input),
    queryKey: ['users', input],
  });

export const listProjectMembersQueryOptions = (input: ListDocumentsInput) =>
  queryOptions({
    queryFn: () => api.list_project_members(input),
    queryKey: ['project_members', input],
  });

export const listProjectMembersRolesQueryOptions = (input: ListDocumentsInput) =>
  queryOptions({
    queryFn: () => api.list_project_members_roles(input),
    queryKey: ['project_members_roles', input],
  });