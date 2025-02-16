import { AuthClient } from '@dfinity/auth-client';

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
      this.authClient = await AuthClient.create();
    }
    return this.authClient;
  }

  public async isAuthenticated(): Promise<boolean> {
    const client = await this.initializeClient();
    return client.isAuthenticated();
  }

  public async login(): Promise<boolean> {
    const authClient = await this.initializeClient();

    const identityProvider = import.meta.env.DEV
      ? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:8080`
      : 'https://identity.ic0.app';

    return new Promise<boolean>((resolve, reject) => {
      authClient.login({
        identityProvider,
        maxTimeToLive: BigInt(7 * 24 * 60 * 60 * 1000 * 1000 * 1000), // 7 days in nanoseconds
        onError: (err) => reject(err),
        onSuccess: () => resolve(true),
      });
    });
  }

  public async logout(): Promise<void> {
    if (this.authClient) {
      await this.authClient.logout();
    }
  }
}
