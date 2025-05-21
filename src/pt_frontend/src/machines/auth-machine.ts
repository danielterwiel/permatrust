import { Principal } from '@dfinity/principal';
import { assign, createActor, fromPromise, log, setup } from 'xstate';

import { getTenantCanisterIdsOptions } from '@/api/queries';
import { getUserOptions } from '@/api/queries/users';
import { queryClient } from '@/api/query-client';
import { isAppError, isIdentityNotFoundError } from '@/utils/is-app-error';

import type {
  Organization,
  Project,
  User,
} from '@/declarations/tenant_canister/tenant_canister.did';

import { createMainActorWrapper, createTenantActorWrapper } from '@/api';
import { Auth } from '@/auth';
import { router } from '@/router';

type AuthMachineTypes = {
  context: {
    isAuthenticated: boolean;
    tenantCanisterIds?: Array<Principal>;
    project?: Pick<Project, 'name'>;
    organization?: Pick<Organization, 'name'>;
    user?: Pick<User, 'first_name' | 'last_name'>;
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
    user: Pick<User, 'first_name' | 'last_name'>;
  }
  | {
    type: 'UPDATE_ORGANIZATION';
    organization: Pick<Organization, 'name'>;
  }
  | {
    type: 'UPDATE_PROJECT';
    project: Pick<Project, 'name'>;
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

        // Only create the main actor initially
        const mainActor = await createMainActorWrapper(client);

        return { actor: { main: mainActor }, success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'Unknown authentication error';
        throw new Error(errorMessage);
      }
    }),

    get_tenant_canister_ids: fromPromise(async () => {
      try {
        const [tenantCanisterId] = await queryClient.ensureQueryData(
          getTenantCanisterIdsOptions(),
        );
        const auth = Auth.getInstance();
        const client = await auth.initializeClient();
        await createTenantActorWrapper(client, tenantCanisterId.toString());

        return {
          tenantCanisterIds: [tenantCanisterId],
        };
      } catch (error) {
        if (isAppError(error) && 'IdentityNotFound' in error) {
          return {
            tenantCanisterIds: [],
          };
        }
        throw new Error('Unexpected error while fetching canister IDs');
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

        if (isAuthenticated) {
          await createMainActorWrapper(client);
          const [canisterPrincipal] =
            await queryClient.ensureQueryData(getTenantCanisterIdsOptions());
          const canisterId = Principal.from(canisterPrincipal);
          await createTenantActorWrapper(client, canisterId.toString());
        }

        return { isAuthenticated };
      } catch (error) {
        if (isIdentityNotFoundError(error)) {
          return { isAuthenticated: true };
        }

        throw new Error('Auth initialization failed');
      }
    }),
  },
  types: {} as AuthMachineTypes,
}).createMachine({
  context: {
    isAuthenticated: false,

    organization: undefined,
    user: undefined,
    project: undefined
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
                UPDATE_ORGANIZATION: 'update_organization',
                UPDATE_PROJECT: 'update_project',
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
              initial: 'check_tenants',
              states: {
                check_tenants: {
                  invoke: {
                    id: 'get_tenant_canister_ids',
                    onDone: [
                      {
                        actions: assign({
                          tenantCanisterIds: ({ event }) =>
                            event.output.tenantCanisterIds,
                        }),
                        guard: ({ event }) =>
                          !!event.output.tenantCanisterIds.length,
                        target: 'check_user',
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
                      actions: log(
                        'TODO: ONBOARDING_ERROR get_tenant_canister_ids',
                      ),
                      target: 'onboarding_error',
                    },
                    src: 'get_tenant_canister_ids',
                  },
                },

                check_user: {
                  invoke: {
                    id: 'get_user',
                    onDone: [
                      {
                        actions: assign({
                          user: ({ event }) => event.output.user,
                        }),
                        guard: ({ event }) => event.output.onboardedUser,
                        target: 'onboarding_complete',
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
                      actions: log(
                        'TODO: ONBOARDING_ERROR check_user',
                      ),
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
                      await router.navigate({ to: '/documents' });
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
                      if (!context.tenantCanisterIds?.length) {
                        await router.navigate({
                          to: '/onboarding/user/create',
                        });
                      } else if (!context.user) {
                        await router.navigate({
                          to: '/onboarding/user/create',
                        });
                      } else if (!context.organization) {
                        await router.navigate({
                          to: '/onboarding/organization/create',
                        });
                      } else if (!context.project) {
                        await router.navigate({
                          to: '/onboarding/project/create',
                        });
                      }
                    },
                  ],
                },
              },
            },

            update_user: {
              entry: assign({
                user: ({ event }) => {
                  if (event.type === 'UPDATE_USER') {
                    return event.user;
                  }
                },
              }),
              always: '#authenticated_idle'
            },

            update_organization: {
              entry: assign({
                organization: ({ event }) => {
                  if (event.type === 'UPDATE_ORGANIZATION') {
                    return event.organization;
                  }
                },
              }),
              always: '#authenticated_idle'
            },

            update_project: {
              entry: assign({
                project: ({ event }) => {
                  if (event.type === 'UPDATE_PROJECT') {
                    return event.project;
                  }
                },
              }),
              always: '#authenticated_idle'
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
