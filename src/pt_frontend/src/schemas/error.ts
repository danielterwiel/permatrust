import type { AppError } from '@/declarations/pt_backend/pt_backend.did';
import { z } from 'zod';

export const AppErrorSchema = z.union([
  z.object({
    InvalidPageSize: z.string(),
  }),
  z.object({
    InvalidInput: z.string(),
  }),
  z.object({
    EntityNotFound: z.string(),
  }),
  z.object({
    InvalidPageNumber: z.string(),
  }),
  z.object({
    Unauthorized: z.null(),
  }),
  z.object({
    InternalError: z.string(),
  }),
]) satisfies z.ZodType<AppError>;
