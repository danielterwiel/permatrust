import { createActor } from '@/declarations/pt_backend';
import { type ActorSubclass, HttpAgent } from '@dfinity/agent';

import { isAppError } from '@/utils/isAppError';

import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did.d';
import type {
  CreateActorFn,
  Result,
  ResultHandler,
  WrappedActor,
} from '@/types/api';
import type { AuthClient } from '@dfinity/auth-client';

export let api = {} as WrappedActor<_SERVICE>;

export async function createAuthenticatedActorWrapper(
  canisterId: string,
  authClient?: AuthClient,
): Promise<WrappedActor<_SERVICE>> {
  if (!authClient) {
    throw new Error('AuthClient not set');
  }

  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const callWithAuth = await wrapWithAuth(actor, authClient);
  const wrappedCall = wrapActor(callWithAuth);
  api = wrappedCall;
  return wrappedCall;
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

  // This should never happen if types are correct, but TypeScript needs it
  throw new Error('Unknown error occurred');
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

// biome-ignore lint/suspicious/noExplicitAny: TODO: type
function wrapActor<T extends Record<string, any>>(actor: T): WrappedActor<T> {
  const wrappedActor: Partial<WrappedActor<T>> = {};

  for (const key in actor) {
    const method = actor[key];

    if (typeof method === 'function') {
      // biome-ignore lint/suspicious/noExplicitAny: TODO: type
      wrappedActor[key] = (async (...args: any[]) => {
        // biome-ignore lint/suspicious/noExplicitAny: TODO: type
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

// Function to wrap an actor with authentication checks
async function wrapWithAuth<T extends ActorSubclass<_SERVICE>>(
  actor: T,
  authClient: AuthClient,
): Promise<T> {
  return new Proxy(actor, {
    get(target, prop, receiver) {
      const original = Reflect.get(target, prop, receiver);
      if (typeof original === 'function') {
        // biome-ignore lint/suspicious/noExplicitAny: TODO: type
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
