import type { authActor } from '@/machines/auth-machine';

export const rootContext = {
  active: {},
  actors: {
    // HACK: we initialize the authActor in the _initialized layout
    auth: undefined as unknown as typeof authActor,
    onboarding: undefined,
  },
  user: undefined,
};
