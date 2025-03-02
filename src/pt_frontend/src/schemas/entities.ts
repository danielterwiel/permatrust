import { z } from 'zod';

const EntityUserVariantSchema = z.object({ User: z.null() });
const EntityUserWithRolesVariantSchema = z.object({
  UserWithRoles: z.null(),
});
const EntityOrganizationVariantSchema = z.object({
  Organization: z.null(),
});
const EntityProjectVariantSchema = z.object({ Project: z.null() });
const EntityDocumentVariantSchema = z.object({ Document: z.null() });
const EntityRevisionVariantSchema = z.object({ Revision: z.null() });
const EntityWorkflowVariantSchema = z.object({ Workflow: z.null() });

export const EntitySchema = z.union([
  EntityUserVariantSchema,
  EntityUserWithRolesVariantSchema,
  EntityOrganizationVariantSchema,
  EntityProjectVariantSchema,
  EntityDocumentVariantSchema,
  EntityRevisionVariantSchema,
  EntityWorkflowVariantSchema,
]);
