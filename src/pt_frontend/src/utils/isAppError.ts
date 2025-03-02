import { AppErrorSchema } from '@/schemas/error';

import type { AppError } from '@/declarations/pt_backend/pt_backend.did';

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
