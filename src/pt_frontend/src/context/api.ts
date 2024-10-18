import type { AuthClient } from "@dfinity/auth-client";
import type { _SERVICE } from "@/declarations/pt_backend/pt_backend.did.d";

import { type ActorSubclass, HttpAgent } from "@dfinity/agent";
import { createActor } from "@/declarations/pt_backend";
import { router } from "@/router";

type CreateActorFn = typeof createActor;

export type ApiContext = {
  call: ActorSubclass<_SERVICE>;
};

export const api: ApiContext = {
  // Initialize call to prevent optional chaining on every canister method call
  call: {} as ActorSubclass<_SERVICE>,
};

async function createAuthenticatedAgent(
  authClient: AuthClient,
): Promise<HttpAgent> {
  const identity = authClient.getIdentity();
  const agent = new HttpAgent({ identity });

  if (process.env.DFX_NETWORK !== "ic") {
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
      if (typeof original === "function") {
        // biome-ignore lint/suspicious/noExplicitAny: types are defined inside declarations
        return async (...args: any[]) => {
          if (!(await authClient.isAuthenticated())) {
            throw new Error("User is not authenticated");
          }
          return original.apply(target, args);
        };
      }
      return original;
    },
  }) as T;
}

export async function createAuthenticatedActorWrapper(
  canisterId: string,
  authClient: AuthClient,
): Promise<ActorSubclass<_SERVICE>> {
  const actor = await createAuthenticatedActor(
    canisterId,
    createActor,
    authClient,
  );
  const call = await wrapWithAuth(actor, authClient);
  api.call = call;
  router.invalidate();
  return call;
}
