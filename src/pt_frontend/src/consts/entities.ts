import type { EntityName } from "@/types/entities";

export const ENTITY = {
  User: { User: null },
  Organisation: { Organisation: null },
  Project: { Project: null },
  Document: { Document: null },
  Revision: { Revision: null },
  Workflow: { Workflow: null },
};

export const ENTITY_NAME = Object.fromEntries(
  (Object.keys(ENTITY) as EntityName[]).map((key) => [key, key]),
) as Record<EntityName, EntityName>;
