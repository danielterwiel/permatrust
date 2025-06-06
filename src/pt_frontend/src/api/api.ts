import { HttpAgent } from '@dfinity/agent';

import { createMainMutations, createTenantMutations, createUpgradeMutations } from '@/api/mutations';
import { isAppError } from '@/utils/is-app-error';

import { canisterIdMain, canisterIdUpgrade } from '@/consts/canisters';

import { createActor as createMainActor } from '@/declarations/main_canister/index';
import { createActor as createTenantActor } from '@/declarations/tenant_canister/index';
import type { AppError as TenantAppError } from '@/declarations/tenant_canister/tenant_canister.did';
import { createActor as createUpgradeActor } from '@/declarations/upgrade_canister/index';
import type {
  ActorWithIndex,
  ApiInterface,
  CreateActorFn,
  MainCanisterApi,
  Result,
  ResultHandler,
  TenantCanisterApi,
  UpgradeCanisterApi,
  WrappedActorWithIndex,
} from '@/types/api';
import type { AuthClient } from '@dfinity/auth-client';

const HOST = import.meta.env.PROD ? 'https://icp0.io' : 'http://localhost:8080';
const ROOT_KEY_ERROR = 'Failed to fetch root key';
const AUTH_ERROR = 'User is not authenticated';
const TENANT_ID_ERROR = 'Tenant canister ID is required';
const UNKNOWN_ERROR = 'Unknown error occurred';

export const api = {} as ApiInterface;

// Actor creation utilities
async function createActorWrapper<T, TApiKey extends keyof ApiInterface>(
  canisterId: string,
  createActorFn: CreateActorFn,
  authClient: AuthClient,
  apiKey: TApiKey,
  createMutationsFn: () => void,
): Promise<T> {
  const actor = await createAuthenticatedActor<T>(
    canisterId,
    createActorFn,
    authClient,
  );
  const wrappedActor = wrapActor<T>(
    wrapWithAuth<T>(actor, authClient),
  ) as T;

  (api as unknown as Record<TApiKey, T>)[apiKey] = wrappedActor;
  createMutationsFn();

  return wrappedActor;
}

// Public API functions
export async function createMainActorWrapper(
  authClient: AuthClient,
): Promise<MainCanisterApi> {
  return createActorWrapper<MainCanisterApi, 'main'>(
    canisterIdMain,
    createMainActor,
    authClient,
    'main',
    createMainMutations,
  );
}

export async function createUpgradeActorWrapper(
  authClient: AuthClient,
): Promise<UpgradeCanisterApi> {
  return createActorWrapper<UpgradeCanisterApi, 'upgrade'>(
    canisterIdUpgrade,
    createUpgradeActor,
    authClient,
    'upgrade',
    createUpgradeMutations,
  );
}

export async function createTenantActorWrapper(
  authClient: AuthClient,
  tenantCanisterId: string,
): Promise<TenantCanisterApi> {
  if (!tenantCanisterId) {
    throw new Error(TENANT_ID_ERROR);
  }

  return createActorWrapper<TenantCanisterApi, 'tenant'>(
    tenantCanisterId,
    createTenantActor,
    authClient,
    'tenant',
    createTenantMutations,
  );
}

// Helper functions
async function createAuthenticatedActor<T>(
  canisterId: string,
  createActorFn: CreateActorFn,
  authClient: AuthClient,
): Promise<ActorWithIndex<T>> {
  const agent = await HttpAgent.create({
    host: HOST,
    identity: authClient.getIdentity(),
  });

  if (!import.meta.env.PROD) {
    await agent.fetchRootKey().catch(() => {
      throw new Error(ROOT_KEY_ERROR);
    });
  }

  return createActorFn(canisterId, { agent }) as unknown as ActorWithIndex<T>;
}

function handleResult<T>(
  result: Result<T>,
  handlers: ResultHandler<T> = {},
): T {
  if ('Ok' in result) {
    handlers.onOk?.(result.Ok);
    return result.Ok;
  }

  handlers.onErr?.(result.Err);

  const error: TenantAppError | Error = isAppError(result.Err)
    ? result.Err
    : new Error(UNKNOWN_ERROR);

  throw error;
}

function isResultHandler(value: unknown): value is ResultHandler<unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('onOk' in value || 'onErr' in value)
  );
}

function wrapActor<T>(actor: ActorWithIndex<T>): WrappedActorWithIndex<T> {
  const wrappedActor: Record<string, (...args: Array<unknown>) => Promise<unknown>> = {};

  for (const key in actor) {
    const method = actor[key];
    if (typeof method === 'function') {
      wrappedActor[key] = async (...args: Array<unknown>) => {
        const lastArg = args[args.length - 1];
        const handlers = isResultHandler(lastArg) ? args.pop() : undefined;

        const result = await method.apply(actor, args);
        return handleResult(result, handlers as ResultHandler<unknown>);
      };
    }
  }

  return wrappedActor as unknown as WrappedActorWithIndex<T>;
}

function wrapWithAuth<T>(
  actor: ActorWithIndex<T>,
  authClient: AuthClient,
): ActorWithIndex<T> {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original === 'function') {
        return async (...args: Array<unknown>) => {
          if (!(await authClient.isAuthenticated())) {
            throw new Error(AUTH_ERROR);
          }
          return original.apply(target, args);
        };
      }
      return original;
    },
  });
}
