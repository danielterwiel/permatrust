import type { createActor } from '@/declarations/pt_backend';
import type {
  _SERVICE,
  AppError,
} from '@/declarations/pt_backend/pt_backend.did.d';
export type CreateActorFn = typeof createActor;

export type Result<T> = { Err: AppError } | { Ok: T };

export type ResultHandler<T> = {
  onErr?: ErrorHandler<AppError>;
  onOk?: (value: T) => void;
};

type ErrorHandler<E> = (error: E) => void;
