import type { AuthClient } from '@dfinity/auth-client';
import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did.d';

import { type ActorSubclass, HttpAgent } from '@dfinity/agent';
import { createActor } from '@/declarations/pt_backend';
import { router } from '@/router';

import type { AppError } from '@/declarations/pt_backend/pt_backend.did';

type CreateActorFn = typeof createActor;

export type ApiContext = {
  call: WrappedActor<_SERVICE>;
};

export const api: ApiContext = {
  call: {} as WrappedActor<_SERVICE>,
};

async function createAuthenticatedAgent(
  authClient: AuthClient,
): Promise<HttpAgent> {
  const identity = authClient.getIdentity();
  const agent = new HttpAgent({ identity });

  if (process.env.DFX_NETWORK !== 'ic') {
    await agent.fetchRootKey();
  }

  return agent;
}

// Function to create an authenticated actor
async function createAuthenticatedActor(
  canisterId: string,
  createActor: CreateActorFn,
  authClient: AuthClient,
): Promise<ActorSubclass<_SERVICE>> {
  const agent = await createAuthenticatedAgent(authClient);
  return createActor(canisterId, { agent }) as ActorSubclass<_SERVICE>;
}

// Function to wrap an actor with authentication checks
async function wrapWithAuth<T extends ActorSubclass<_SERVICE>>(
  actor: T,
  authClient: AuthClient,
): Promise<T> {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original === 'function') {
        // biome-ignore lint/suspicious/noExplicitAny: types are defined inside declarations
        return async (...args: any[]) => {
          if (!(await authClient.isAuthenticated())) {
            throw new Error('User is not authenticated');
          }
          return original.apply(target, args);
        };
      }
      return original;
    },
  }) as T;
}

type Result<T> = { Ok: T } | { Err: AppError };

type ErrorHandler<E> = (error: E) => void;

type ResultHandler<T> = {
  onOk?: (value: T) => void;
  onErr?: ErrorHandler<AppError>;
};

export function handleResult<T>(
  result: Result<T>,
  handlers: ResultHandler<T> = {},
): T | AppError {
  if ('Ok' in result) {
    handlers.onOk?.(result.Ok);
    return result.Ok;
  }
  handlers.onErr?.(result.Err);
  return result.Err;
}

type WrappedActor<T> = {
  [K in keyof T]: T[K] extends (...args: infer A) => Promise<Result<infer R>>
    ? (...args: [...A, ResultHandler<R>?]) => Promise<R>
    : T[K];
};

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
function wrapActor<T extends Record<string, any>>(actor: T): WrappedActor<T> {
  const wrappedActor: Partial<WrappedActor<T>> = {};

  for (const key in actor) {
    const method = actor[key];

    if (typeof method === 'function') {
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      wrappedActor[key] = (async (...args: any[]) => {
        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
        let handlers: ResultHandler<any> | undefined;
        const lastArg = args[args.length - 1];
        if (
          lastArg &&
          typeof lastArg === 'object' &&
          ('onOk' in lastArg || 'onErr' in lastArg)
        ) {
          handlers = args.pop();
        }

        const result = await method(...args);
        return handleResult(result, handlers);
      }) as WrappedActor<T>[typeof key];
    } else {
      wrappedActor[key] = method;
    }
  }

  return wrappedActor as WrappedActor<T>;
}

export async function createAuthenticatedActorWrapper(
  canisterId: string,
  authClient: AuthClient,
): Promise<WrappedActor<_SERVICE>> {
  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const callWithAuth = await wrapWithAuth(actor, authClient);
  const wrappedCall = wrapActor(callWithAuth);
  api.call = wrappedCall;
  router.invalidate();
  return wrappedCall;
}
