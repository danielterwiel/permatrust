import { entityPermissionSchema } from '@/schemas/permissions';

import type { EntityPermission } from '@/declarations/pt_backend/pt_backend.did';

export function createEntityPermissionVariant(
  entity: string,
  permission: string,
): EntityPermission {
  const variantToValidate = {
    [entity]: {
      [permission]: null,
    },
  };

  const result = entityPermissionSchema.safeParse(variantToValidate);

  if (!result.success) {
    throw new Error(
      `Invalid entity-permission combination: ${entity}::${permission}`,
    );
  }

  return variantToValidate as EntityPermission;
}
