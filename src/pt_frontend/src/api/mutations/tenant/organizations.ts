import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createOrganizationMutations = () => {
  const useCreateOrganization = createMutationHook(
    api.tenant.create_organization,
    ['organizations'],
    {
      successToast: {
        title: 'Organization created',
      },
    },
  );

  return {
    useCreateOrganization,
  };
};
