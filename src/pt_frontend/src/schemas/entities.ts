import { z } from "zod";

// export const EntityDocumentName = z.string('Document');
// export const EntityUserName = z.string('User');
// export const EntityProjectName = z.string('Project');
// export const EntityOrganisationName = z.string('Organisation');
// export const EntityRevisionName = z.string('Revision');
// export const EntityWorkflowName = z.string('Workflow');

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

export type EntityUser = z.infer<typeof EntityUserSchema>;
export type EntityOrganisation = z.infer<typeof EntityOrganisationSchema>;
export type EntityProject = z.infer<typeof EntityProjectSchema>;
export type EntityDocument = z.infer<typeof EntityUserSchema>;
export type EntityRevision = z.infer<typeof EntityRevisionSchema>;
export type EntityWorkflow = z.infer<typeof EntityWorkflowSchema>;
