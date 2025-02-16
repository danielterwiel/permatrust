import { createActor } from '@/declarations/pt_backend/index';
import {
  type ActorMethod,
  type ActorSubclass,
  HttpAgent,
} from '@dfinity/agent';

import { isAppError } from '@/utils/isAppError';
import { transformBigIntsToNumbers } from '@/utils/transformBigIntsToNumbers';

import { queryClient } from './query-client';

import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did';
import type { Result, ResultHandler } from '@/types/api';
import type { AuthClient } from '@dfinity/auth-client';

const HOST = import.meta.env.PROD ? 'https://icp0.io' : 'http://localhost:8080';

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

/**
 * Type guard that checks whether a value is a ResultHandler.
 */
function isResultHandler<T>(value: unknown): value is ResultHandler<T> {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('onOk' in value || 'onErr' in value)
  );
}

/**
 * Wrap an actor to map each method onto our ApiType and integrate react-query.
 */
function wrapActor(actor: Actor): ApiType {
  const wrapped = {} as ApiType;

  (Object.keys(actor) as Array<keyof _SERVICE>).forEach((key) => {
    const orig = actor[key];
    if (typeof orig === 'function') {
      wrapped[key] = wrapMethod(orig, key);
    } else {
      wrapped[key] = orig;
    }
  });

  return wrapped;
}

/**
 * Wrap a method while preserving its type signature and integrating react-query.
 */
function wrapMethod<K extends keyof _SERVICE>(
  method: _SERVICE[K],
  key: K,
): ApiType[K] {
  return (async (...args: unknown[]) => {
    let handler: ResultHandler<any> | undefined;

    // Check whether the last argument is a valid ResultHandler
    if (args.length && isResultHandler(args[args.length - 1])) {
      handler = args.pop() as ResultHandler<any>;
    }

    // Build a unique query key using the method name and arguments.
    const queryKey = [key, ...args];

    // Define the query function which calls the original method.
    const queryFn = async (): Promise<Result<any>> => {
      return (await method(...args)) as Result<any>;
    };

    const queryKeyTransformed = transformBigIntsToNumbers(queryKey);

    // Use react-query's caching mechanism.
    const result = await queryClient.fetchQuery({
      queryFn,
      queryKey: queryKeyTransformed,
    });

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
