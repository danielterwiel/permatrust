import { createQueryOptions } from '@/utils/create-query-options';

import type { PaginationInput } from '@/declarations/tenant_canister/tenant_canister.did';
import type { InviteId } from '@/types/entities';

import { api } from '@/api';

export const getInviteOptions = (id: string) => {
  return createQueryOptions({
    queryFn: () => api.tenant.get_invite(id),
    queryKey: ['invite', { id }],
  });
};

export const listInvitesOptions = (input: { pagination: PaginationInput }) =>
  createQueryOptions({
    queryFn: () => api.tenant.list_invites(input.pagination),
    queryKey: ['invites', input],
  });
