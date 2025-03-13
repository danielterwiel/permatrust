import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createUserMutations = () => {
  const useCreateUser = createMutationHook(api.create_user, ['users'], {
    successToast: {
      title: 'User created',
    },
  });

  return {
    useCreateUser,
  };
};
