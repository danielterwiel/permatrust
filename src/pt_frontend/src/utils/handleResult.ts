import { notFound } from '@tanstack/react-router';
import type { AppError } from '@/declarations/pt_backend/pt_backend.did';

type Result<T> = { Ok: T } | { Err: AppError };

type ErrorHandler<E> = (error: E) => void;

type ResultHandler<T> = {
  onOk?: (value: T) => T;
  onErr?: ErrorHandler<AppError>;
};

export function handleResult<T>(
  result: Result<T>,
  handlers: ResultHandler<T> = {},
): T {
  if ('Ok' in result) {
    if (handlers.onOk) {
      return handlers.onOk(result.Ok);
    }
    return result.Ok;
  }

  if (handlers.onErr) {
    handlers.onErr(result.Err);
  }

  throw notFound({
    data: `An error occurred: ${JSON.stringify(result.Err)}`,
  });
}
