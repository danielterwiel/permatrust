import { entityPermissionSchema } from '@/schemas/permissions';

import type { Permission } from '@/declarations/tenant_canister/tenant_canister.did';

export function createPermissionVariant(
  entity: string,
  permission: string,
): Permission {
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

  return variantToValidate as Permission;
}
