import { queryClient } from '@/api/query-client';

export const rootContext = {
  active: {},
  actors: {
    // biome-ignore lint/style/noNonNullAssertion: Assigned in _initialized.tsx
    auth: undefined!,
    onboarding: undefined,
  },
  query: queryClient,
  user: undefined,
};
