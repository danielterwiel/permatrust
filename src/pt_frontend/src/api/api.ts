import { createActor } from '@/declarations/pt_backend/index';
import { type ActorSubclass, HttpAgent } from '@dfinity/agent';

import { isAppError } from '@/utils/isAppError';

import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did';
import type { CreateActorFn, Result, ResultHandler } from '@/types/api';
import type { AuthClient } from '@dfinity/auth-client';

const HOST = import.meta.env.PROD ? 'https://icp0.io' : 'http://localhost:8080';

type ActorWithIndex = ActorSubclass<_SERVICE> & { [key: string]: unknown };

type WrappedActorWithIndex = {
  [K in keyof ActorWithIndex]: ActorWithIndex[K] extends (
    ...args: infer A
  ) => Promise<Result<infer T>>
    ? (...args: [...A, ResultHandler<T>?]) => Promise<T>
    : ActorWithIndex[K];
};

export let api = {} as WrappedActorWithIndex;

export async function createAuthenticatedActorWrapper(
  canisterId: string,
  authClient: AuthClient,
): Promise<WrappedActorWithIndex> {
  if (!authClient) {
    throw new Error('AuthClient not set');
  }
  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const wrappedActor = wrapActor(await wrapWithAuth(actor, authClient));
  api = wrappedActor;
  return wrappedActor;
}

export function handleResult<T>(
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

async function createAuthenticatedActor(
  canisterId: string,
  createActor: CreateActorFn,
  authClient: AuthClient,
): Promise<ActorWithIndex> {
  const agent = await HttpAgent.create({
    host: HOST,
    identity: authClient.getIdentity(),
  });
  if (!import.meta.env.PROD) {
    await agent.fetchRootKey().catch(() => {
      throw new Error('Failed to fetch root key');
    });
  }
  return createActor(canisterId, { agent }) as unknown as ActorWithIndex;
}

function wrapActor<T extends ActorWithIndex>(actor: T): WrappedActorWithIndex {
  const wrappedActor: Partial<WrappedActorWithIndex> = {};
  for (const key in actor) {
    const method = actor[key];
    if (typeof method === 'function') {
      wrappedActor[key] = (async (...args: unknown[]) => {
        let handlers: ResultHandler<unknown> | undefined;
        const lastArg = args[args.length - 1];
        if (
          lastArg &&
          typeof lastArg === 'object' &&
          ('onOk' in lastArg || 'onErr' in lastArg)
        ) {
          handlers = args.pop() as ResultHandler<unknown>;
        }
        const result = await method.apply(actor, args);
        return handleResult(result, handlers);
      }) as WrappedActorWithIndex[typeof key];
    } else {
      wrappedActor[key] = method;
    }
  }
  return wrappedActor as WrappedActorWithIndex;
}

async function wrapWithAuth<T extends ActorWithIndex>(
  actor: T,
  authClient: AuthClient,
): Promise<T> {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original === 'function') {
        return async (...args: unknown[]) => {
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
