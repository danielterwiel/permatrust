import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

export const getOrganizationQueryOptions = (id: number) =>
  queryOptions({
    queryFn: () => api.get_organization({ id }),
    queryKey: ['organization', { id }],
  });

export const listOrganizationsQueryOptions = (pagination: PaginationInput) =>
  queryOptions({
    queryFn: () => api.list_organizations(pagination),
    queryKey: ['organizations', { pagination }],
  });