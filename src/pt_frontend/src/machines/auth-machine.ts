import { assign, createActor, fromPromise, log, setup } from 'xstate';

import { listOrganizationsOptions } from '@/api/queries/organizations';
import { getUserOptions } from '@/api/queries/users';
import { queryClient } from '@/api/query-client';

import { DEFAULT_PAGINATION } from '@/consts/pagination';

import type {
  Organization,
  User,
} from '@/declarations/pt_backend/pt_backend.did';

import { createAuthenticatedActorWrapper } from '@/api';
import { Auth } from '@/auth';
import { router } from '@/router';

const canisterIdPtBackend = process.env.CANISTER_ID_PT_BACKEND as string;

type AuthMachineTypes = {
  context: {
    isAuthenticated: boolean;

    organizations?: Array<Organization>;

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

        const isAuthenticated = await client.isAuthenticated();

        if (!isAuthenticated) {
          await auth.login();

          const verifyAuth = await client.isAuthenticated();
          if (!verifyAuth) {
            throw new Error('Authentication failed after login attempt');
          }
        }

        const actor = await createAuthenticatedActorWrapper(
          canisterIdPtBackend,
          client,
        );

        return { actor, success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown authentication error';
        throw new Error(errorMessage);
      }
    }),

    get_user: fromPromise(async () => {
      try {
        const user = await queryClient.ensureQueryData(getUserOptions());

        return {
          onboardedUser: true,
          user,
        };
      } catch (_error) {
        return {
          onboardedUser: false,
        };
      }
    }),

    initialize_auth: fromPromise(async () => {
      try {
        const auth = Auth.getInstance();
        const client = await auth.initializeClient();

        const isAuthenticated = await client.isAuthenticated();

        const actor = isAuthenticated
          ? await createAuthenticatedActorWrapper(canisterIdPtBackend, client)
          : undefined;

        return { actor, client, isAuthenticated };
      } catch (_error) {
        throw new Error('Auth initialization failed');
      }
    }),

    list_organizations: fromPromise(async () => {
      try {
        const organizationsResult = await queryClient.ensureQueryData(
          listOrganizationsOptions(DEFAULT_PAGINATION),
        );
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
      } catch (_error) {
        return {
          onboardedOrganizations: false,
        };
      }
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
                LOGOUT: 'logout',
                UPDATE_USER: 'update_user',
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
                          event.output.onboardedOrganizations,
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
                      entry: log('TODO: ONBOARDING_ERROR check_organizations'),
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
                        guard: ({ event }) => event.output.onboardedUser,
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
                      entry: log('TODO: ONBOARDING_ERROR check_user'),
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
                  always: '#authenticated_idle',
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
                },
              },
            },

            update_user: {
              always: 'onboarding.check_user',
              entry: assign({
                user: ({ event }) => {
                  if (event.type === 'UPDATE_USER') {
                    return event.user;
                  }
                },
              }),
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
