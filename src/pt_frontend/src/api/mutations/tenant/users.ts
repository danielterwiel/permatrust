import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createUserMutations = () => {
  const useCreateUser = createMutationHook(api.tenant.create_user, ['create_user'], {
    successToast: {
      title: 'User created',
    },
  });

  return {
    useCreateUser,
  };
};
