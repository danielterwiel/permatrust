import type { createActor } from '@/declarations/pt_backend';
import type { AppError } from '@/declarations/pt_backend/pt_backend.did';
import type { _SERVICE } from '@/declarations/pt_backend/pt_backend.did.d';
export type CreateActorFn = typeof createActor;

export type ErrorHandler<E> = (error: E) => void;

export type Result<T> = { Err: AppError } | { Ok: T };

export type ResultHandler<T> = {
  onErr?: ErrorHandler<AppError>;
  onOk?: (value: T) => void;
};

export type WrappedActor<T> = {
  [K in keyof T]: T[K] extends (...args: infer Args) => Promise<Result<infer R>>
    ? (...args: [...Args, ResultHandler<R>?]) => Promise<R>
    : T[K];
};
