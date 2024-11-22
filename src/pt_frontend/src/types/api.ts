import type { createActor } from '@/declarations/pt_backend';
import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did.d';
import type { AppError } from '@/declarations/pt_backend/pt_backend.did';
export type CreateActorFn = typeof createActor;

export type WrappedActor<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<Result<infer R>>
    ? (...args: [...Args, ResultHandler<R>?]) => Promise<R>
    : T[K];
};

export type ErrorHandler<E> = (error: E) => void;

export type ResultHandler<T> = {
  onOk?: (value: T) => void;
  onErr?: ErrorHandler<AppError>;
};

export type Result<T> = { Ok: T } | { Err: AppError };
