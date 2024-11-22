import { AppErrorSchema } from '@/schemas/error';
import type { AppError } from '@/declarations/pt_backend/pt_backend.did';

export function isAppError(
  response: unknown,
  specificError?: keyof AppError,
): response is AppError {
  if (typeof response !== 'object' || response === null) {
    return false;
  }

  const result = AppErrorSchema.safeParse(response);

  if (!result.success) {
    return false;
  }

  if (specificError && 'type' in response) {
    return response.type === specificError;
  }

  return true;
}
