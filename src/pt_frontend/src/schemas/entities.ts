import { toBigIntSchema, toNumberSchema } from './primitives';

import type {
  DocumentId,
  OrganizationId,
  ProjectId,
  RevisionId,
  RoleId,
  UserId,
  WorkflowId,
} from '@/types/entities';

// Entity ID schemas
export const documentIdSchema = toBigIntSchema.transform(
  (val): DocumentId => val,
);
export const organizationIdSchema = toNumberSchema.transform(
  (val): OrganizationId => val,
);
export const projectIdSchema = toNumberSchema.transform(
  (val): ProjectId => val,
);
export const revisionIdSchema = toBigIntSchema.transform(
  (val): RevisionId => val,
);
export const roleIdSchema = toBigIntSchema.transform((val): RoleId => val);
export const userIdSchema = toBigIntSchema.transform((val): UserId => val);
export const workflowIdSchema = toNumberSchema.transform(
  (val): WorkflowId => val,
);
