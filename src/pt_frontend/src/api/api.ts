import { HttpAgent } from '@dfinity/agent';

import { createMutations } from '@/api/mutations';
import { createActor } from '@/declarations/pt_backend/index';
import { isAppError } from '@/utils/is-app-error';

import type {
  AppError,
  _SERVICE,
} from '@/declarations/pt_backend/pt_backend.did';
import type { CreateActorFn, Result, ResultHandler } from '@/types/api';
import type { ActorSubclass } from '@dfinity/agent';
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
  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const wrappedActor = wrapActor(wrapWithAuth(actor, authClient));
  api = wrappedActor;
  createMutations();
  return wrappedActor;
}

async function createAuthenticatedActor(
  canisterId: string,
  createActorFn: CreateActorFn,
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
  return createActorFn(canisterId, { agent }) as ActorWithIndex;
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

  let error: AppError | Error;
  if (isAppError(result.Err)) {
    error = result.Err;
  } else {
    error = new Error('Unknown error occurred');
  }

  throw error;
}

function wrapActor<T extends ActorWithIndex>(actor: T): WrappedActorWithIndex {
  const wrappedActor: Partial<WrappedActorWithIndex> = {};
  for (const key in actor) {
    const method = actor[key];
    if (typeof method === 'function') {
      wrappedActor[key] = (async (...args: Array<T>) => {
        let handlers: ResultHandler<unknown> | undefined;
        const lastArg = args[args.length - 1];
        if (
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

function wrapWithAuth<T extends ActorWithIndex>(
  actor: T,
  authClient: AuthClient,
): T {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original === 'function') {
        return async (...args: Array<T>) => {
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
