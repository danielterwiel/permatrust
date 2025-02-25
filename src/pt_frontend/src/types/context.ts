import type { User } from '@/declarations/pt_backend/pt_backend.did';
import type { authActor } from '@/machines/auth-machine';
import type { QueryClient } from '@tanstack/react-query';

export type RootRouteContext = {
  actors: {
    auth: typeof authActor;
  };
  getTitle?: () => string;
  query: QueryClient;
  user?: User;
};
