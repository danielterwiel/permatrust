import { queryClient } from '@/api/query-client';

export const rootContext = {
  active: {},
  actors: {
    // biome-ignore lint/style/noNonNullAssertion: gets hydrated in @app/auth/auth-provider.tsx
    auth: undefined!,
    onboarding: undefined,
  },
  query: queryClient,
  user: undefined,
};
