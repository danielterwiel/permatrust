import { createQueryOptions } from '@/utils/create-query-options';

import { api } from '@/api';

export const getTenantCanisterIdsOptions = () =>
  createQueryOptions({
    queryFn: api.main.get_tenant_canister_ids,
    queryKey: ['user'],
  });
