import { Auth } from '@/auth';
import { router } from '@/router';
import { assign, createActor, fromPromise, log, setup } from 'xstate';

import { api, createAuthenticatedActorWrapper } from '@/api';

import { CANISTER_ID_PT_BACKEND } from '@/consts/canisters';
import { DEFAULT_PAGINATION } from '@/consts/pagination';

import type {
  Organization,
  User,
} from '@/declarations/pt_backend/pt_backend.did';

type AuthMachineTypes = {
  context: {
    isAuthenticated: boolean;

    organizations?: Organization[];

    user?: User;
  };
  events:
    | {
        type: 'LOGIN';
      }
    | {
        type: 'LOGOUT';
      }
    | {
        type: 'UPDATE_USER';
        user: User;
      };
};

const authMachine = setup({
  actors: {
    authenticate: fromPromise(async () => {
      try {
        const auth = Auth.getInstance();
        const client = await auth.initializeClient();
        const isAuthenticated = await client?.isAuthenticated();
        if (!isAuthenticated) {
          await auth.login();
        }
        await createAuthenticatedActorWrapper(CANISTER_ID_PT_BACKEND, client);
        return { success: true };
      } catch (error) {
        if (typeof error === 'string') {
          throw new Error(error);
        }
        throw new Error('Unknown error');
      }
    }),

    get_user: fromPromise(async () => {
      try {
        const userResult = await api.get_user();
        if (!userResult) {
          throw new Error('User not found');
        }
        return {
          onboardedUser: true,
          user: userResult,
        };
      } catch (_error) {
        return {
          onboardedUser: false,
        };
      }
    }),

    initialize_auth: fromPromise(async () => {
      const auth = Auth.getInstance();
      const client = await auth.initializeClient();
      const isAuthenticated = await client?.isAuthenticated();
      return { isAuthenticated };
    }),

    list_organizations: fromPromise(async () => {
      const organizationsResult =
        await api.list_organizations(DEFAULT_PAGINATION);
      const [organizations] = organizationsResult;

      if (!organizations.length) {
        return {
          onboardedOrganizations: false,
        };
      }
      return {
        onboardedOrganizations: true,
        organizations,
      };
    }),
  },
  types: {} as AuthMachineTypes,
}).createMachine({
  context: {
    isAuthenticated: false,

    organizations: undefined,
    user: undefined,
  },
  id: 'authMachine',
  initial: 'initializing',
  states: {
    // TODO: handle error
    error: {},

    initialized: {
      initial: 'idle',
      states: {
        authenticated: {
          id: 'authenticated',
          initial: 'onboarding',
          states: {
            idle: {
              id: 'authenticated_idle',
              on: {
                LOGIN: 'onboarding',
                LOGOUT: {
                  target: 'logout',
                },
              },
            },

            logout: {
              always: '#initialized_idle',
              entry: async () => {
                const auth = Auth.getInstance();
                await auth.logout();
                await router.navigate({
                  search: {
                    redirect: window.location.pathname,
                  },
                  to: '/login',
                });
              },
            },

            onboarding: {
              initial: 'check_user',
              states: {
                check_organizations: {
                  invoke: {
                    id: 'check_organizations',
                    onDone: [
                      {
                        actions: assign({
                          organizations: ({ event }) =>
                            event.output.organizations,
                        }),
                        guard: ({ event }) =>
                          event.output?.onboardedOrganizations,
                        target: 'onboarding_complete',
                      },
                      {
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/organization/create',
                          });
                        },
                        target: 'onboarding_incomplete',
                      },
                    ],
                    onError: {
                      target: 'onboarding_error',
                    },
                    src: 'list_organizations',
                  },
                },

                check_user: {
                  invoke: {
                    id: 'check_user',
                    onDone: [
                      {
                        actions: assign({
                          user: ({ event }) => event.output.user,
                        }),
                        guard: ({ event }) => event.output?.onboardedUser,
                        target: 'check_organizations',
                      },
                      {
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/user/create',
                          });
                        },
                        target: 'onboarding_incomplete',
                      },
                    ],
                    onError: {
                      target: 'onboarding_error',
                    },
                    src: 'get_user',
                  },
                },

                onboarding_complete: {
                  always: '#authenticated_idle',
                  entry: async () => {
                    const search = new URLSearchParams(window.location.search);
                    if (search.has('redirect')) {
                      await router.navigate({
                        to: search.get('redirect') as string,
                      });
                    } else if (window.location.pathname === '/login') {
                      await router.navigate({ to: '/projects' });
                    }
                    // we're refreshing, no need to do anything
                  },
                },

                onboarding_error: {
                  entry: log('TODO: ONBOARDING_ERROR'),
                },

                onboarding_incomplete: {
                  entry: [
                    async ({ context }) => {
                      if (context.user) {
                        await router.navigate({
                          to: '/onboarding/organization/create',
                        });
                      } else {
                        await router.navigate({
                          to: '/onboarding/user/create',
                        });
                      }
                    },
                  ],
                  target: '#authenticated_idle',
                },
              },
            },
          },
        },

        authenticating: {
          invoke: {
            id: 'authenticating',
            onDone: {
              target: 'authenticated',
            },
            onError: {
              target: 'unauthorized',
            },
            src: 'authenticate',
          },
        },

        idle: {
          id: 'initialized_idle',
          on: {
            LOGIN: 'authenticating',
          },
        },

        unauthorized: {
          always: '#initialized_idle',
          entry: async () => {
            await router.navigate({
              search: {
                error: true,
              },
              to: '/login',
            });
          },
        },
      },
    },

    initializing: {
      invoke: {
        id: 'initializing',
        onDone: [
          {
            actions: assign({
              isAuthenticated: ({ event }) => event.output.isAuthenticated,
            }),
            guard: ({ event }) => event.output.isAuthenticated,
            target: 'initialized.authenticated',
          },
          {
            target: 'initialized',
          },
        ],
        onError: {
          target: 'error',
        },
        src: 'initialize_auth',
      },
    },
  },
});

export const authActor = createActor(authMachine).start();
