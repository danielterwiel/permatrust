import { api } from '@/api';

import { createQueryOptions } from '@/utils/createQueryOptions';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';

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
