import { api } from '@/api';
import { createAuthenticatedActorWrapper } from '@/api';
import { setup, fromPromise, createActor, assign, log } from 'xstate';
import { router } from '@/router';
import { Auth } from '@/auth';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { CANISTER_ID_PT_BACKEND } from '@/consts/canisters';
import type { DeepPartial } from '@/types/deep-partial';
import type {
  User,
  PaginatedOrganisationsResultOk,
} from '@/declarations/pt_backend/pt_backend.did';

type AuthMachineTypes = {
  context: {
    isAuthenticated: boolean;

    user?: User;
    organisations?: DeepPartial<PaginatedOrganisationsResultOk>;

    navigateTo?: string;
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
  types: {} as AuthMachineTypes,
  actors: {
    initialize_auth: fromPromise(async () => {
      const auth = Auth.getInstance();
      const client = await auth.initializeClient();
      const isAuthenticated = await client?.isAuthenticated();
      return { isAuthenticated };
    }),

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
        organisations: organisationsResult,
        onboardedOrganisations: true,
      };
    }),
  },
}).createMachine({
  id: 'authMachine',
  context: {
    isAuthenticated: false,

    user: undefined,
    organisations: undefined,
  },
  initial: 'initializing',
  states: {
    initializing: {
      invoke: {
        id: 'initializing',
        src: 'initialize_auth',
        onError: {
          target: 'error',
        },
        onDone: [
          {
            guard: ({ event }) => event.output.isAuthenticated,
            actions: assign({
              isAuthenticated: ({ event }) => event.output.isAuthenticated,
            }),
            target: 'initialized.authenticated',
          },
          {
            target: 'initialized',
          },
        ],
      },
    },

    // TODO: handle error
    error: {},

    initialized: {
      initial: 'idle',
      states: {
        idle: {
          id: 'initialized_idle',
          on: {
            LOGIN: 'authenticating',
          },
        },

        authenticating: {
          invoke: {
            id: 'authenticating',
            src: 'authenticate',
            onDone: {
              target: 'authenticated',
            },
            onError: {
              target: 'unauthorized',
            },
          },
        },

        unauthorized: {
          entry: async () => {
            await router.navigate({
              to: '/authenticate',
              search: {
                error: true,
              },
            });
          },
          always: '#initialized_idle',
        },

        authenticated: {
          id: 'authenticated',
          initial: 'onboarding',
          states: {
            onboarding: {
              initial: 'check_user',
              states: {
                check_user: {
                  invoke: {
                    id: 'check_user',
                    src: 'get_user',
                    onDone: [
                      {
                        guard: ({ event }) => event.output?.onboardedUser,
                        actions: assign({
                          user: ({ event }) => event.output.user,
                        }),
                        target: 'check_organisations',
                      },
                      {
                        target: 'onboarding_incomplete',
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/users/create',
                          });
                        },
                      },
                    ],
                    onError: {
                      target: 'onboarding_error',
                    },
                  },
                },

                check_organisations: {
                  invoke: {
                    id: 'check_organisations',
                    src: 'list_organisations',
                    onDone: [
                      {
                        guard: ({ event }) =>
                          event.output?.onboardedOrganisations,
                        target: 'onboarding_complete',
                        actions: assign({
                          organisations: ({ event }) =>
                            event.output.organisations,
                        }),
                      },
                      {
                        target: 'onboarding_incomplete',
                        actions: async () => {
                          await router.navigate({
                            to: '/onboarding/organisations/create',
                          });
                        },
                      },
                    ],
                    onError: {
                      target: 'onboarding_error',
                    },
                  },
                },

                onboarding_incomplete: {
                  entry: [
                    async () => {
                      await router.navigate({ to: '/onboarding/users/create' });
                    },
                  ],
                  target: '#authenticated_idle',
                },

                onboarding_error: {
                  entry: log('TODO: ONBOARDING_ERROR'),
                },

                onboarding_complete: {
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
                  always: '#authenticated_idle',
                },
              },
            },

            logout: {
              entry: async () => {
                const auth = Auth.getInstance();
                await auth.logout();
                await router.navigate({
                  to: '/authenticate',
                  search: {
                    redirect: window.location.pathname,
                  },
                });
              },
              always: '#initialized_idle',
            },

            idle: {
              id: 'authenticated_idle',
              on: {
                LOGOUT: {
                  target: 'logout',
                },
                LOGIN: 'onboarding',
              },
            },
          },
        },
      },
    },
  },
});

export const authActor = createActor(authMachine).start();
