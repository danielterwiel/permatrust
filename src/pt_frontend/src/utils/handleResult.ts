import { notFound } from '@tanstack/react-router';

import type { AppError } from '@/declarations/pt_backend/pt_backend.did';

type ErrorHandler<E> = (error: E) => void;

type Result<T> = { Err: AppError } | { Ok: T };

type ResultHandler<T> = {
  onErr?: ErrorHandler<AppError>;
  onOk?: (value: T) => T;
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
