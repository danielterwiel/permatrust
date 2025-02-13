import { createActor } from '@/declarations/pt_backend/index';
import {
  type ActorMethod,
  type ActorSubclass,
  HttpAgent,
} from '@dfinity/agent';

import { isAppError } from '@/utils/isAppError';

import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did';
import type { Result, ResultHandler } from '@/types/api';
import type { AuthClient } from '@dfinity/auth-client';

const HOST = import.meta.env.PROD ? 'https://icp0.io' : 'http://localhost:8080';

// For each method in _SERVICE, append an optional ResultHandler parameter.
export type ApiType = {
  [K in keyof _SERVICE]: _SERVICE[K] extends ActorMethod<infer Args, infer Ret>
    ? (...args: [...Args, ResultHandler<Ret>?]) => Promise<Ret>
    : never;
};

export let api: _SERVICE = {} as _SERVICE;

type Actor = ActorSubclass<_SERVICE>;
type CreateActorFn = (canisterId: string, opts: { agent: HttpAgent }) => Actor;

export async function createAuthenticatedActorWrapper(
  canisterId: string,
  authClient: AuthClient,
): Promise<ApiType> {
  if (!authClient) {
    throw new Error('AuthClient not set');
  }
  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const authedActor = await wrapWithAuth(actor, authClient);
  api = wrapActor(authedActor);
  return api;
}

async function createAuthenticatedActor(
  canisterId: string,
  createActor: CreateActorFn,
  authClient: AuthClient,
): Promise<Actor> {
  const agent = await HttpAgent.create({
    host: HOST,
    identity: authClient.getIdentity(),
  });

  if (!import.meta.env.PROD) {
    await agent.fetchRootKey().catch(() => {
      throw new Error('Failed to fetch root key');
    });
  }

  return createActor(canisterId, { agent });
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
  if (isAppError(result.Err)) {
    throw new Error(JSON.stringify(result.Err));
  }
  throw new Error('Unknown error occurred');
}

// Wrap an actor to map each method onto our ApiType
function wrapActor(actor: Actor): ApiType {
  const wrapped = {} as ApiType;
  (Object.keys(actor) as Array<keyof _SERVICE>).forEach((key) => {
    const orig = actor[key];
    if (typeof orig === 'function') {
      wrapped[key] = wrapMethod(orig);
    } else {
      wrapped[key] = orig;
    }
  });
  return wrapped;
}

// Wrap a method while preserving its type signature
function wrapMethod<K extends keyof _SERVICE>(method: _SERVICE[K]): ApiType[K] {
  return (async (...args: any[]) => {
    let handler: ResultHandler<any> | undefined;
    // If last argument is a result handler, remove it.
    if (
      args.length &&
      args[args.length - 1] &&
      typeof args[args.length - 1] === 'object' &&
      ('onOk' in args[args.length - 1] || 'onErr' in args[args.length - 1])
    ) {
      handler = args.pop();
    }
    // Invoke the original canister method.
    const result = (await method(...args)) as Result<any>;
    return handleResult(result, handler);
  }) as ApiType[K];
}

async function wrapWithAuth(
  actor: Actor,
  authClient: AuthClient,
): Promise<Actor> {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const orig = Reflect.get(target, prop, receiver);
      if (typeof orig === 'function') {
        return async (...args: unknown[]) => {
          if (!(await authClient.isAuthenticated())) {
            throw new Error('User is not authenticated');
          }
          return orig.apply(target, args);
        };
      }
      return orig;
    },
  });
}
