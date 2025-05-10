import { HttpAgent } from '@dfinity/agent';

import { createMainMutations, createTenantMutations } from '@/api/mutations';
import { isAppError } from '@/utils/is-app-error';

import { createActor as createMainActor } from '@/declarations/main_canister/index';
import type { _SERVICE as MainService } from '@/declarations/main_canister/main_canister.did';
import { createActor as createTenantActor } from '@/declarations/tenant_canister/index';
import type {
  AppError as TenantAppError,
  _SERVICE as TenantService,
} from '@/declarations/tenant_canister/tenant_canister.did';
import type { CreateActorFn, Result, ResultHandler } from '@/types/api';
import type { ActorSubclass } from '@dfinity/agent';
import type { AuthClient } from '@dfinity/auth-client';

const HOST = import.meta.env.PROD ? 'https://icp0.io' : 'http://localhost:8080';

const canisterIdMain = process.env.CANISTER_ID_MAIN_CANISTER as string;

type ActorWithIndex<T> = ActorSubclass<T> & { [key: string]: unknown };

type WrappedActorWithIndex<T> = {
  [K in keyof ActorWithIndex<T>]: ActorWithIndex<T>[K] extends (
    ...args: infer A
  ) => Promise<Result<infer U>>
  ? (...args: [...A, ResultHandler<U>?]) => Promise<U>
  : ActorWithIndex<T>[K];
};

type TenantCanisterApi = WrappedActorWithIndex<TenantService>;
type MainCanisterApi = WrappedActorWithIndex<MainService>;

interface ApiInterface {
  tenant: TenantCanisterApi;
  main: MainCanisterApi;
}

export let api = {} as ApiInterface;

/**
 * Creates an authenticated main canister actor
 */
export async function createMainActorWrapper(
  authClient: AuthClient,
): Promise<MainCanisterApi> {
  const mainActor = await createAuthenticatedActor<MainService>(
    canisterIdMain,
    createMainActor,
    authClient,
  );
  const wrappedMainActor = wrapActor<MainService>(
    wrapWithAuth<MainService>(mainActor, authClient),
  ) as MainCanisterApi;

  api.main = wrappedMainActor;
  createMainMutations();

  return wrappedMainActor;
}

/**
 * Creates an authenticated tenant canister actor with a specific canister ID
 */
export async function createTenantActorWrapper(
  authClient: AuthClient,
  tenantCanisterId: string,
): Promise<TenantCanisterApi> {
  if (!tenantCanisterId) {
    throw new Error('Tenant canister ID is required');
  }

  const tenantActor = await createAuthenticatedActor<TenantService>(
    tenantCanisterId,
    createTenantActor,
    authClient,
  );
  const wrappedTenantActor = wrapActor<TenantService>(
    wrapWithAuth<TenantService>(tenantActor, authClient),
  ) as TenantCanisterApi;

  api.tenant = wrappedTenantActor;
  createTenantMutations();

  return wrappedTenantActor;
}

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
      throw new Error('Failed to fetch root key');
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

  if (handlers.onErr) {
    handlers.onErr(result.Err);
  }

  let error: TenantAppError | Error;
  if (isAppError(result.Err)) {
    error = result.Err;
  } else {
    error = new Error('Unknown error occurred');
  }

  throw error;
}

function wrapActor<T>(actor: ActorWithIndex<T>): WrappedActorWithIndex<T> {
  const wrappedActor: Record<string, () => Promise<unknown>> = {};

  for (const key in actor) {
    const method = actor[key];
    if (typeof method === 'function') {
      wrappedActor[key] = async (...args: Array<unknown>) => {
        let handlers: ResultHandler<unknown> | undefined;
        const lastArg = args[args.length - 1];
        if (
          typeof lastArg === 'object' &&
          lastArg !== null &&
          ('onOk' in lastArg || 'onErr' in lastArg)
        ) {
          handlers = args.pop() as ResultHandler<unknown>;
        }
        const result = await method.apply(actor, args);
        return handleResult(result, handlers);
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
            throw new Error('User is not authenticated');
          }
          return original.apply(target, args);
        };
      }
      return original;
    },
  });
}
