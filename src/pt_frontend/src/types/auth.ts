import type { Identity } from '@dfinity/agent';
import type { AuthClient } from '@dfinity/auth-client';

export type AuthContext = {
  authClient?: AuthClient;
  identity?: Identity;
  isAuthenticated: boolean;
};
