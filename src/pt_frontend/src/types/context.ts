import type { authActor } from '@/machines/auth';

import type { User } from '@/declarations/tenant_canister/tenant_canister.did';
import type { QueryClient } from '@tanstack/react-query';

export type RootRouteContext = {
  actors: {
    auth: typeof authActor;
  };
  getTitle?: () => string;
  query: QueryClient;
  user?: User;
};
