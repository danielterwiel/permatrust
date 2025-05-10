import { z } from 'zod';

import type { AppError } from '@/declarations/tenant_canister/tenant_canister.did';

export const IdentityNotFoundSchema = z.object({ IdentityNotFound: z.null() });

export const AppErrorSchema = z.union([
  IdentityNotFoundSchema,
  z.object({ EntityNotFound: z.string() }),
  z.object({ InternalError: z.string() }),
  z.object({ InvalidInput: z.string() }),
  z.object({ InvalidPageNumber: z.string() }),
  z.object({ InvalidPageSize: z.string() }),
  z.object({ InvalidStateTransition: z.string() }),
  z.object({ SpawnCanister: z.string() }),
  z.object({ Unauthorized: z.null() }),
  z.object({ ValidationError: z.string() }),
]) satisfies z.ZodType<AppError>;
