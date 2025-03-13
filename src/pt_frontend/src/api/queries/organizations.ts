import { createQueryOptions } from '@/utils/create-query-options';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

import { api } from '@/api';

export const getOrganizationOptions = (id: number) =>
  createQueryOptions({
    queryFn: () => api.get_organization({ id }),
    queryKey: ['organization', { id }],
  });

export const getOrganizationsOptions = (pagination: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_organizations(pagination),
    queryKey: ['organizations', { pagination }],
  });
