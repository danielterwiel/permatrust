import { assign, createActor, log, setup } from 'xstate';

import { authActors } from './actors';

import type {
  AuthMachineTypes,
  InitializeAuthDoneEvent,
  TenantCanisterIdsDoneEvent,
  UserDoneEvent,
} from './types';

import { Auth } from '@/auth';
import { router } from '@/router';

const authMachine = setup({
  types: {} as AuthMachineTypes,
  actors: authActors,
  actions: {
    assignIsAuthenticated: assign({
      isAuthenticated: ({ event }) => {
        const typedEvent = event as InitializeAuthDoneEvent;
        return typedEvent.output.isAuthenticated;
      },
    }),
    assignTenantCanisterIds: assign({
      tenantCanisterIds: ({ event }) => {
        const typedEvent = event as TenantCanisterIdsDoneEvent;
        return typedEvent.output.tenantCanisterIds;
      },
    }),
    assignUser: assign({
      user: ({ event }) => {
        const typedEvent = event as UserDoneEvent;
        return typedEvent.output.user;
      },
    }),
    updateUser: assign({
      user: ({ event }) => {
        if (event.type === 'UPDATE_USER') {
          return event.user;
        }
        return undefined;
      },
    }),
    updateOrganization: assign({
      organization: ({ event }) => {
        if (event.type === 'UPDATE_ORGANIZATION') {
          return event.organization;
        }
        return undefined;
      },
    }),
    updateProject: assign({
      project: ({ event }) => {
        if (event.type === 'UPDATE_PROJECT') {
          return event.project;
        }
        return undefined;
      },
    }),
    navigateToLogin: async () => {
      await router.navigate({
        search: { redirect: window.location.pathname },
        to: '/login',
      });
    },
    navigateToUnauthorized: async () => {
      await router.navigate({
        search: { error: true },
        to: '/login',
      });
    },
    navigateToUserCreate: async () => {
      await router.navigate({ to: '/onboarding/user/create' });
    },
    navigateAfterOnboarding: async () => {
      const search = new URLSearchParams(window.location.search);
      if (search.has('redirect')) {
        await router.navigate({ to: search.get('redirect') as string });
      } else if (window.location.pathname === '/login') {
        await router.navigate({ to: '/documents' });
      }
    },
    navigateOnboardingIncomplete: async ({ context }) => {
      if (!context.tenantCanisterIds?.length) {
        await router.navigate({ to: '/onboarding/user/create' });
      } else if (!context.user) {
        await router.navigate({ to: '/onboarding/user/create' });
      } else if (!context.organization) {
        await router.navigate({ to: '/onboarding/organization/create' });
      } else if (!context.project) {
        await router.navigate({ to: '/onboarding/project/create' });
      }
    },
    logout: async () => {
      const auth = Auth.getInstance();
      await auth.logout();
      await router.navigate({
        search: { redirect: window.location.pathname },
        to: '/login',
      });
    },
    logOnboardingError: log('TODO: ONBOARDING_ERROR'),
    logTenantCanisterError: log('TODO: ONBOARDING_ERROR get_tenant_canister_ids'),
    logUserError: log('TODO: ONBOARDING_ERROR check_user'),
  },
  guards: {
    isAuthenticated: ({ event }) => {
      const typedEvent = event as InitializeAuthDoneEvent;
      return typedEvent.output.isAuthenticated;
    },
    hasTenantCanisterIds: ({ event }) => {
      const typedEvent = event as TenantCanisterIdsDoneEvent;
      return !!typedEvent.output.tenantCanisterIds.length;
    },
    hasOnboardedUser: ({ event }) => {
      const typedEvent = event as UserDoneEvent;
      return typedEvent.output.onboardedUser;
    },
  },
}).createMachine({
  id: 'authMachine',
  context: ({ input }) => ({
    isAuthenticated: input.initiallyAuthenticated ?? false,
    organization: undefined,
    user: undefined,
    project: undefined,
    tenantCanisterIds: undefined,
  }),
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
                UPDATE_USER: 'updateUser',
                UPDATE_ORGANIZATION: 'updateOrganization',
                UPDATE_PROJECT: 'updateProject',
              },
            },

            logout: {
              always: '#initialized_idle',
              entry: 'logout',
            },

            onboarding: {
              initial: 'checkTenants',
              states: {
                checkTenants: {
                  invoke: {
                    id: 'getTenantCanisterIds',
                    src: 'getTenantCanisterIds',
                    onDone: [
                      {
                        actions: 'assignTenantCanisterIds',
                        guard: 'hasTenantCanisterIds',
                        target: 'checkUser',
                      },
                      {
                        actions: 'navigateToUserCreate',
                        target: 'onboardingIncomplete',
                      },
                    ],
                    onError: {
                      actions: 'logTenantCanisterError',
                      target: 'onboardingError',
                    },
                  },
                },

                checkUser: {
                  invoke: {
                    id: 'getUser',
                    src: 'getUser',
                    onDone: [
                      {
                        actions: 'assignUser',
                        guard: 'hasOnboardedUser',
                        target: 'onboardingComplete',
                      },
                      {
                        actions: 'navigateToUserCreate',
                        target: 'onboardingIncomplete',
                      },
                    ],
                    onError: {
                      actions: 'logUserError',
                      target: 'onboardingError',
                    },
                  },
                },

                onboardingComplete: {
                  always: '#authenticated_idle',
                  entry: 'navigateAfterOnboarding',
                },

                onboardingError: {
                  entry: 'logOnboardingError',
                },

                onboardingIncomplete: {
                  always: '#authenticated_idle',
                  entry: 'navigateOnboardingIncomplete',
                },
              },
            },

            updateUser: {
              entry: 'updateUser',
              always: '#authenticated_idle',
            },

            updateOrganization: {
              entry: 'updateOrganization',
              always: '#authenticated_idle',
            },

            updateProject: {
              entry: 'updateProject',
              always: '#authenticated_idle',
            },
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

        idle: {
          id: 'initialized_idle',
          on: {
            LOGIN: 'authenticating',
          },
        },

        unauthorized: {
          always: '#initialized_idle',
          entry: 'navigateToUnauthorized',
        },
      },
    },

    initializing: {
      invoke: {
        id: 'initializing',
        src: 'initializeAuth',
        onDone: [
          {
            actions: 'assignIsAuthenticated',
            guard: 'isAuthenticated',
            target: 'initialized.authenticated',
          },
          {
            target: 'initialized',
          },
        ],
        onError: {
          target: 'error',
        },
      },
    },
  },
});

export const authActor = createActor(authMachine, {
  input: { initiallyAuthenticated: false },
}).start();
export { authMachine };
