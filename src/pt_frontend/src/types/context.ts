import type { User } from '@/declarations/pt_backend/pt_backend.did';
import type { authActor } from '@/machines/auth-machine';

export type RootRouteContext = {
  getTitle?: () => string;
  actors: {
    auth: typeof authActor;
  };
  user?: User;
};
