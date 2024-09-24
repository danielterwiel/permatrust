import type { Identity } from "@dfinity/agent";
import { AuthClient, LocalStorage } from "@dfinity/auth-client";

export const auth: Auth = {
	loggedIn: false,
	authenticated: false,
	authClient: undefined,
	identity: undefined,
	initAuthClient: async () => {
		const client = await AuthClient.create({
			storage: new LocalStorage(),
			keyType: "Ed25519",
		});
		const isAuthenticated = await client.isAuthenticated();
		auth.authClient = client;
		auth.authenticated = isAuthenticated;
		auth.loggedIn = isAuthenticated;
		auth.identity = client.getIdentity();
		return isAuthenticated;
	},
	authenticate: async () => {
		if (!auth.authClient) {
			throw new Error("AuthClient not initialized");
		}
		const loginOptions = {
			identity: auth.identity,
			maxTimeToLive: BigInt(8 * 24 * 3600 * 1e9), // 8 days in nanoseconds
		};

		const identityProvider = import.meta.env.DEV
			? `http://${process.env.CANISTER_ID_INTERNET_IDENTITY}.localhost:4943`
			: "https://identity.ic0.app";

		return new Promise((resolve, reject) => {
			if (!auth.authClient) {
				reject(false);
			}
			auth.authClient?.login({
				...loginOptions,
				identityProvider,
				onSuccess: () => {
					auth.authenticated = true;
					resolve(true);
				},
				onError: (err) => {
					reject(err);
				},
			});
		});
	},
	logout: () => {
		auth.loggedIn = false;
		auth.authenticated = false;
		auth.authClient?.logout();
	},
};

export type Auth = {
	loggedIn: boolean;
	authenticated: boolean;
	authClient: AuthClient | undefined;
	identity: Identity | undefined;
	initAuthClient: () => Promise<boolean>;
	authenticate: () => Promise<boolean>;
	logout: () => void;
};
