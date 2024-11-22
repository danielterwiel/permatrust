import type { Identity } from '@dfinity/agent';
import type { AuthClient } from '@dfinity/auth-client';

export type AuthContext = {
  isAuthenticated: boolean;
  identity?: Identity;
  authClient?: AuthClient;
};
