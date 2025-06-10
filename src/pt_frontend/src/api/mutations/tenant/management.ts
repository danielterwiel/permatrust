import { toast } from '@/hooks/use-toast';
import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createManagementMutations = () => {
  const useSelfUpgrade = createMutationHook(
    api.tenant.self_upgrade,
    ['self_upgrade'],
    {
      successToast: {
        title: 'You have upgraded your canister',
      },
      errorToast: false,
      onError: (error) => {
        toast({
          title: 'Upgrade failed',
          description:
            error.message || 'An error occurred during canister upgrade',
          variant: 'destructive',
        });
      },
    },
  );

  return {
    useSelfUpgrade,
  };
};
