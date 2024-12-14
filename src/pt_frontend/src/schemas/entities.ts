import { z } from "zod";

export const EntityNameSchema = z.union([
  z.literal("User"),
  z.literal("Organization"),
  z.literal("Project"),
  z.literal("Document"),
  z.literal("Revision"),
  z.literal("Workflow"),
]);

export const EntityUserVariantSchema = z.object({ User: z.null() });
export const EntityOrganizationVariantSchema = z.object({ Organization: z.null() });
export const EntityProjectVariantSchema = z.object({ Project: z.null() });
export const EntityDocumentVariantSchema = z.object({ Document: z.null() });
export const EntityRevisionVariantSchema = z.object({ Revision: z.null() });
export const EntityWorkflowVariantSchema = z.object({ Workflow: z.null() });

export const EntitySchema = z.union([
  EntityUserVariantSchema,
  EntityOrganizationVariantSchema,
  EntityProjectVariantSchema,
  EntityDocumentVariantSchema,
  EntityRevisionVariantSchema,
  EntityWorkflowVariantSchema,
]);
