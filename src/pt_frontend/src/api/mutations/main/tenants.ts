import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createTenantMutations = () => {
  const useCreateTenantCanister = createMutationHook(
    api.main.create_tenant_canister,
    ['tenant_canisters'],
    {
      successToast: {
        title: 'Canister created',
      },
    },
  );

  return {
    useCreateTenantCanister,
  };
};
