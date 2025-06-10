import type { createActor as createMainActor } from '@/declarations/main_canister';
import type { _SERVICE as MainService } from '@/declarations/main_canister/main_canister.did.d';
import type { createActor as createCompanyActor } from '@/declarations/tenant_canister';
import type {
  AppError,
  _SERVICE as TenantService,
} from '@/declarations/tenant_canister/tenant_canister.did.d';
import type { createActor as createUpgradeActor } from '@/declarations/upgrade_canister';
import type { _SERVICE as UpgradeService } from '@/declarations/upgrade_canister/upgrade_canister.did.d';
import type { ActorSubclass } from '@dfinity/agent/lib/cjs';

export type CreateActorFn =
  | typeof createCompanyActor
  | typeof createMainActor
  | typeof createUpgradeActor;

export type CompanyCanisterActor = TenantService;
export type MainCanisterActor = MainService;
export type UpgradeCanisterActor = UpgradeService;

export type Result<T> = { Err: AppError } | { Ok: T };

export type ResultHandler<T> = {
  onErr?: ErrorHandler<AppError>;
  onOk?: (value: T) => void;
};

export type ErrorHandler<TAppError> = (error: TAppError) => void;

export type ActorWithIndex<T> = ActorSubclass<T> & { [key: string]: unknown };

export type WrappedActorWithIndex<T> = {
  [K in keyof ActorWithIndex<T>]: ActorWithIndex<T>[K] extends (
    ...args: infer A
  ) => Promise<Result<infer U>>
    ? (...args: [...A, ResultHandler<U>?]) => Promise<U>
    : ActorWithIndex<T>[K];
};

export type MainCanisterApi = WrappedActorWithIndex<MainService>;
export type UpgradeCanisterApi = WrappedActorWithIndex<UpgradeService>;
export type TenantCanisterApi = WrappedActorWithIndex<TenantService>;

export interface ApiInterface {
  tenant: TenantCanisterApi;
  main: MainCanisterApi;
  upgrade: UpgradeCanisterApi;
}
