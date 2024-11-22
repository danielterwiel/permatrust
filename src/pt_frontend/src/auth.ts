import { AuthClient, IdbStorage } from '@dfinity/auth-client';
import { CANISTER_ID_PT_BACKEND } from '@/consts/canisters';
import { createAuthenticatedActorWrapper } from '@/api';

const TIMEOUT_MINS = 30;

export class Auth {
  private static instance: Auth | undefined = undefined;
  private authClient: AuthClient | undefined = undefined;

  public static getInstance(): Auth {
    if (!Auth.instance) {
      Auth.instance = new Auth();
    }
    return Auth.instance;
  }

  public async initializeClient(): Promise<AuthClient> {
    if (!this.authClient) {
      this.authClient = await AuthClient.create({
        storage: new IdbStorage(),
        keyType: 'Ed25519',
        idleOptions: {
          idleTimeout: TIMEOUT_MINS * 60 * 1000,
          disableDefaultIdleCallback: false, // TODO: implement true
        },
      });

      const isAuthenticated = await this.authClient.isAuthenticated();
      if (isAuthenticated) {
        await createAuthenticatedActorWrapper(
          CANISTER_ID_PT_BACKEND,
          this.authClient,
        );
      }
    }
    return this.authClient;
  }

  public async login(): Promise<boolean> {
    const authClient = await this.initializeClient();
    if (!CANISTER_ID_PT_BACKEND) {
      throw new Error('Canister ID not set');
    }

    const identityProvider = import.meta.env.DEV
      ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
      : 'https://identity.ic0.app';

    return new Promise<boolean>((resolve, reject) => {
      authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(1 * 3600 * 1e9), // 1 hour in nanoseconds
        onSuccess: () => resolve(true),
        onError: (err) => {
          return reject(err);
        },
      });
    });
  }

  public async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
  }

  public async isAuthenticated(): Promise<boolean> {
    const client = await this.initializeClient();
    return client.isAuthenticated();
  }
}
