import type { createActor as createMainActor } from '@/declarations/main_canister';
import type {
  _SERVICE as MainService,
} from '@/declarations/main_canister/main_canister.did.d';
import type { createActor as createCompanyActor } from '@/declarations/tenant_canister';
import type {
  AppError,
  _SERVICE as TenantService,
} from '@/declarations/tenant_canister/tenant_canister.did.d';
import type { createActor as createUpgradeActor } from '@/declarations/upgrade_canister';
import type {
  _SERVICE as UpgradeService,
} from '@/declarations/upgrade_canister/upgrade_canister.did.d';

export type CreateActorFn = typeof createCompanyActor | typeof createMainActor | typeof createUpgradeActor;

export type CompanyCanisterActor = TenantService;
export type MainCanisterActor = MainService;
export type UpgradeCanisterActor = UpgradeService;

export type Result<T> = { Err: AppError } | { Ok: T };

export type ResultHandler<T> = {
  onErr?: ErrorHandler<AppError>;
  onOk?: (value: T) => void;
};

type ErrorHandler<TAppError> = (error: TAppError) => void;
