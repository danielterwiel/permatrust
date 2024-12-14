import { z } from "zod";

export const documentPermissionSchema = z.union([
  z.object({ Share: z.null() }),
  z.object({ Read: z.null() }),
  z.object({ Comment: z.null() }),
  z.object({ Archive: z.null() }),
  z.object({ Delete: z.null() }),
  z.object({ Create: z.null() }),
  z.object({ Update: z.null() }),
  z.object({ Export: z.null() })
]);

export const userPermissionSchema = z.union([
  z.object({ ChangeRole: z.null() }),
  z.object({ Deactivate: z.null() }),
  z.object({ Read: z.null() }),
  z.object({ Delete: z.null() }),
  z.object({ Update: z.null() }),
  z.object({ Invite: z.null() })
]);

export const organizationPermissionSchema = z.union([
  z.object({ Read: z.null() }),
  z.object({ ConfigureSettings: z.null() }),
  z.object({ ManageMembers: z.null() }),
  z.object({ ViewAuditLogs: z.null() }),
  z.object({ Delete: z.null() }),
  z.object({ Create: z.null() }),
  z.object({ ManageBilling: z.null() }),
  z.object({ Update: z.null() })
]);

export const revisionPermissionSchema = z.union([
  z.object({ Approve: z.null() }),
  z.object({ Read: z.null() }),
  z.object({ Reject: z.null() }),
  z.object({ Compare: z.null() }),
  z.object({ Create: z.null() }),
  z.object({ Rollback: z.null() })
]);

export const projectPermissionSchema = z.union([
  z.object({ ManageSettings: z.null() }),
  z.object({ Read: z.null() }),
  z.object({ AssignMembers: z.null() }),
  z.object({ Archive: z.null() }),
  z.object({ ConfigureSettings: z.null() }),
  z.object({ ManageMembers: z.null() }),
  z.object({ Delete: z.null() }),
  z.object({ Create: z.null() }),
  z.object({ Update: z.null() }),
  z.object({ ViewMetrics: z.null() })
]);

export const workflowPermissionSchema = z.union([
  z.object({ ViewHistory: z.null() }),
  z.object({ Read: z.null() }),
  z.object({ Resume: z.null() }),
  z.object({ Pause: z.null() }),
  z.object({ Execute: z.null() }),
  z.object({ Delete: z.null() }),
  z.object({ Create: z.null() }),
  z.object({ Update: z.null() })
]);


export const entityPermissionSchema = z.union([
  z.object({ User: userPermissionSchema }),
  z.object({ Document: documentPermissionSchema }),
  z.object({ Organization: organizationPermissionSchema }),
  z.object({ Revision: revisionPermissionSchema }),
  z.object({ Project: projectPermissionSchema }),
  z.object({ Workflow: workflowPermissionSchema })
]);
