import { Auth } from '@/auth';
import { router } from '@/router';
import { assign, createActor, fromPromise, log, setup } from 'xstate';

import { api, createAuthenticatedActorWrapper } from '@/api';

import { CANISTER_ID_PT_BACKEND } from '@/consts/canisters';
import { DEFAULT_PAGINATION } from '@/consts/pagination';

import type {
  PaginatedOrganisationsResultOk,
  User,
} from '@/declarations/pt_backend/pt_backend.did';
import type { DeepPartial } from '@/types/deep-partial';

type AuthMachineTypes = {
  context: {
    isAuthenticated: boolean;

    navigateTo?: string;
    organisations?: DeepPartial<PaginatedOrganisationsResultOk>;

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

    list_organisations: fromPromise(async () => {
      const organisationsResult =
        await api.list_organisations(DEFAULT_PAGINATION);
      const [organisations] = organisationsResult;

      if (!organisations.length) {
        return {
          onboardedOrganisations: false,
        };
      }
      return {
        onboardedOrganisations: true,
        organisations: organisationsResult,
      };
    }),
  },
  types: {} as AuthMachineTypes,
}).createMachine({
  context: {
    isAuthenticated: false,

    organisations: undefined,
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
                  to: '/authenticate',
                });
              },
            },

            onboarding: {
              initial: 'check_user',
              states: {
                check_organisations: {
                  invoke: {
                    id: 'check_organisations',
                    onDone: [
                      {
                        actions: assign({
                          organisations: ({ event }) =>
                            event.output.organisations,
                        }),
                        guard: ({ event }) =>
                          event.output?.onboardedOrganisations,
                        target: 'onboarding_complete',
                      },
                      {
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/organisations/create',
                          });
                        },
                        target: 'onboarding_incomplete',
                      },
                    ],
                    onError: {
                      target: 'onboarding_error',
                    },
                    src: 'list_organisations',
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
                        target: 'check_organisations',
                      },
                      {
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/users/create',
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
                    } else if (window.location.pathname === '/authenticate') {
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
                    async () => {
                      await router.navigate({ to: '/onboarding/users/create' });
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
              to: '/authenticate',
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
