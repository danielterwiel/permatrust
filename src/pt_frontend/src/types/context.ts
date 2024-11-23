import type { User } from '@/declarations/pt_backend/pt_backend.did';
import type { authActor } from '@/machines/auth-machine';

export type RootRouteContext = {
  actors: {
    auth: typeof authActor;
  };
  getTitle?: () => string;
  user?: User;
};
