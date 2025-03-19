import { createQueryOptions } from '@/utils/create-query-options';

import type { ListUsersInput } from '@/declarations/pt_backend/pt_backend.did';

import { api } from '@/api';

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
