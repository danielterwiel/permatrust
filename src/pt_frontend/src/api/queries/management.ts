import { createQueryOptions } from '@/utils/create-query-options';

import { api } from '@/api';

// NOTE: admin only
export const getAllTenantCanisterIds = () => {
  return createQueryOptions({
    queryFn: api.main.get_all_tenant_canister_ids,
    queryKey: ['management', 'get_all_tenant_canister_ids'],
  });
};

export const getTenantCanisterIds = () => {
  return createQueryOptions({
    queryFn: api.main.get_tenant_canister_ids,
    queryKey: ['management', 'get_tenant_canister_ids'],
  });
};

export const getAllWasmVersionsOptions = () => {
  return createQueryOptions({
    queryFn: api.upgrade.get_all_wasm_versions,
    queryKey: ['management', 'get_all_wasm_versions'],
  });
};

