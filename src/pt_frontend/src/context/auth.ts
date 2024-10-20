import type { Identity } from '@dfinity/agent';
import { AuthClient, LocalStorage } from '@dfinity/auth-client';
import { createAuthenticatedActorWrapper } from './api';
import { router } from '@/router';

const canisterId = process.env.CANISTER_ID_PT_BACKEND;

export type AuthContext = {
  isAuthenticated: boolean;
  identity: Identity | undefined;

  initializeAuth: () => Promise<boolean>;

  login: () => Promise<boolean>;
  logout: () => void;
};

export const auth: AuthContext = {
  isAuthenticated: false,
  identity: undefined,

  initializeAuth,

  login,
  logout,
};

let authClient: AuthClient | null = null;

export async function initializeAuth(): Promise<boolean> {
  if (auth.isAuthenticated) {
    return true;
  }
  if (!canisterId) {
    throw new Error('Canister ID not set');
  }
  authClient = await AuthClient.create({
    storage: new LocalStorage(),
    keyType: 'Ed25519',
  });
  auth.isAuthenticated = await authClient.isAuthenticated();
  if (auth.isAuthenticated) {
    auth.identity = authClient.getIdentity();
    await createAuthenticatedActorWrapper(canisterId, authClient);
    router.invalidate();
  }
  return auth.isAuthenticated;
}

async function login(): Promise<boolean> {
  if (!authClient) {
    throw new Error('AuthClient not initialized. Call initializeAuth() first.');
  }
  if (!canisterId) {
    throw new Error('Canister ID not set');
  }

  const identityProvider = import.meta.env.DEV
    ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
    : 'https://identity.ic0.app';

  const loginOptions = {
    identityProvider,
    maxTimeToLive: BigInt(1 * 3600 * 1e9), // 1 hour in nanoseconds
  };

  return new Promise<boolean>((resolve, reject) => {
    authClient?.login({
      ...loginOptions,
      onSuccess: async () => {
        if (!authClient) {
          return reject('AuthClient got lost during login');
        }
        auth.isAuthenticated = true;
        auth.identity = authClient.getIdentity();
        await createAuthenticatedActorWrapper(canisterId, authClient);
        router.invalidate();
        resolve(true);
      },
      onError: (err) => {
        reject(err);
      },
    });
  });
}

function logout(): void {
  auth.isAuthenticated = false;
  authClient?.logout();
  router.invalidate();
}
