import { notFound } from '@tanstack/react-router';

export function handleResult<T, E>(result: { Ok: T } | { Err: E }): T {
  if ('Ok' in result) {
    return result.Ok;
  } else {
    throw notFound({ data: 'Resource not found or an error occurred' });
  }
}
