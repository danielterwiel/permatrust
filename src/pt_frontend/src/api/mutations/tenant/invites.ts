import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createInviteMutations = () => {
  const useCreateInvite = createMutationHook(
    api.tenant.create_invite,
    ['create_invite'],
    {
      successToast: {
        title: 'Invite created',
      },
    },
  );

  return {
    useCreateInvite,
  };
};
