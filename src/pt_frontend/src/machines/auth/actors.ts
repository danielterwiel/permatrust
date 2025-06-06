import { Principal } from '@dfinity/principal';
import { fromPromise } from 'xstate';

import { getTenantCanisterIdsOptions } from '@/api/queries';
import { getUserOptions } from '@/api/queries/users';
import { queryClient } from '@/api/query-client';
import { isAppError, isIdentityNotFoundError } from '@/utils/is-app-error';

import type {
  AuthenticateOutput,
  InitializeAuthOutput,
  TenantCanisterIdsOutput,
  UserOutput,
} from './types';

import { createMainActorWrapper, createTenantActorWrapper, createUpgradeActorWrapper } from '@/api';
import { Auth } from '@/auth';

export const authActors = {
  authenticate: fromPromise(async (): Promise<AuthenticateOutput> => {
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

  getTenantCanisterIds: fromPromise(async (): Promise<TenantCanisterIdsOutput> => {
    try {
      const [tenantCanisterId] = await queryClient.ensureQueryData(
        getTenantCanisterIdsOptions(),
      );
      const auth = Auth.getInstance();
      const client = await auth.initializeClient();
      await createUpgradeActorWrapper(client);
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

  getUser: fromPromise(async (): Promise<UserOutput> => {
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

  initializeAuth: fromPromise(async (): Promise<InitializeAuthOutput> => {
    try {
      const auth = Auth.getInstance();
      const client = await auth.initializeClient();

      const isAuthenticated = await client.isAuthenticated();

      if (isAuthenticated) {
        await createMainActorWrapper(client);
        await createUpgradeActorWrapper(client);
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
};
