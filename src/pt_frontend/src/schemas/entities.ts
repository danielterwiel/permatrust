import { z } from 'zod';

export const EntityUserSchema = z.object({ User: z.null() });
export const EntityOrganisationSchema = z.object({ Organisation: z.null() });
export const EntityProjectSchema = z.object({ Project: z.null() });
export const EntityDocumentSchema = z.object({ Document: z.null() });
export const EntityRevisionSchema = z.object({ Revision: z.null() });
export const EntityWorkflowSchema = z.object({ Workflow: z.null() });

export const entitySchema = z.union([
  EntityUserSchema,
  EntityOrganisationSchema,
  EntityProjectSchema,
  EntityDocumentSchema,
  EntityRevisionSchema,
  EntityWorkflowSchema,
]);
