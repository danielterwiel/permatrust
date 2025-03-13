import { queryClient } from '@/api/query-client';

export const rootContext = {
  active: {},
  actors: {
    auth: undefined!,
    onboarding: undefined,
  },
  query: queryClient,
  user: undefined,
};
