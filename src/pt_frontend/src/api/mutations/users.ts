import { api } from '@/api';

import { createMutationHook } from '@/utils/createMutationHook';

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
