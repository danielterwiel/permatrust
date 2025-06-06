import { toBigIntSchema, toNumberSchema } from './primitives';

import type {
  DocumentId,
  LogId,
  ProjectId,
  RevisionId,
  RoleId,
  WorkflowId,
} from '@/types/entities';

// Entity ID schemas
export const documentIdSchema = toBigIntSchema.transform(
  (val): DocumentId => val,
);
export const projectIdSchema = toNumberSchema.transform(
  (val): ProjectId => val,
);
export const revisionIdSchema = toBigIntSchema.transform(
  (val): RevisionId => val,
);
export const roleIdSchema = toBigIntSchema.transform((val): RoleId => val);
export const inviteIdSchema = toBigIntSchema.transform(
  (val): RevisionId => val,
);
export const logIdSchema = toBigIntSchema.transform((val): LogId => val);
export const userIdSchema = toNumberSchema.transform(
  (val): number => val,
);
export const workflowIdSchema = toNumberSchema.transform(
  (val): WorkflowId => val,
);
