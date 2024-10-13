import { notFound } from '@tanstack/react-router';

export function handleResult<T, E>(result: { Ok: T } | { Err: E }): T {
  if ('Ok' in result) {
    return result.Ok;
  }

  throw notFound({ data: `An error occurred: ${JSON.stringify(result.Err)}` });
}
