import { AppErrorSchema, IdentityNotFoundSchema } from '@/schemas/error';

import type { AppError } from '@/declarations/tenant_canister/tenant_canister.did';

export function isAppError(response: unknown): response is AppError {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const result = AppErrorSchema.safeParse(response);

  if (!result.success) {
    return false;
  }

  return true;
}

export function isIdentityNotFoundError(
  response: unknown,
): response is AppError {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  const result = IdentityNotFoundSchema.safeParse(response);
  if (!result.success) {
    return false;
  }
  return true;
}
