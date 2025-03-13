import { api } from '@/api';
import { createMutationHook } from '@/utils/create-mutation-hook';

export const createOrganizationMutations = () => {
  const useCreateOrganization = createMutationHook(
    api.create_organization,
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
