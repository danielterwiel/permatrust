import type {
  Organization,
  Project,
  User,
} from '@/declarations/tenant_canister/tenant_canister.did';
import type { MainCanisterApi } from '@/types/api';
import type { Principal } from '@dfinity/principal';

export type AuthContext = {
  isAuthenticated: boolean;
  tenantCanisterIds?: Array<Principal>;
  project?: Pick<Project, 'name'>;
  organization?: Pick<Organization, 'name'>;
  user?: Pick<User, 'first_name' | 'last_name'>;
};

// Actor output types
export type AuthenticateOutput = {
  actor: { main: MainCanisterApi };
  success: boolean;
};

export type TenantCanisterIdsOutput = {
  tenantCanisterIds: Array<Principal>;
};

export type UserOutput = {
  onboardedUser: boolean;
  user?: Pick<User, 'first_name' | 'last_name'>;
};

export type InitializeAuthOutput = {
  isAuthenticated: boolean;
};

// Actor done event types
export type AuthenticateDoneEvent = {
  type: 'xstate.done.actor.authenticating';
  output: AuthenticateOutput;
};

export type TenantCanisterIdsDoneEvent = {
  type: 'xstate.done.actor.getTenantCanisterIds';
  output: TenantCanisterIdsOutput;
};

export type UserDoneEvent = {
  type: 'xstate.done.actor.getUser';
  output: UserOutput;
};

export type InitializeAuthDoneEvent = {
  type: 'xstate.done.actor.initializing';
  output: InitializeAuthOutput;
};

export type AuthEvents =
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; user: Pick<User, 'first_name' | 'last_name'> }
  | { type: 'UPDATE_ORGANIZATION'; organization: Pick<Organization, 'name'> }
  | { type: 'UPDATE_PROJECT'; project: Pick<Project, 'name'> }
  | AuthenticateDoneEvent
  | TenantCanisterIdsDoneEvent
  | UserDoneEvent
  | InitializeAuthDoneEvent;

export type AuthInput = {
  initiallyAuthenticated?: boolean;
};

export type AuthMachineTypes = {
  context: AuthContext;
  events: AuthEvents;
  input: AuthInput;
};
