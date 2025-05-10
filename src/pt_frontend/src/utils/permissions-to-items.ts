import type { Permission } from '@/declarations/tenant_canister/tenant_canister.did';

import { capitalizeFirstLetter, pascalToHumanReadable } from '@/utils';

export const permissionsToItems = (permissions: Array<Permission>) => {
  return Object.entries(permissions).flatMap(([_, entityPermission]) => {
    const [entityVariant] = Object.entries(entityPermission);

    const [entity, permissionVariant] = entityVariant;
    const [permission] = Object.keys(permissionVariant);

    if (!permission) {
      throw new Error('Empty Permission variant');
    }

    const label = pascalToHumanReadable(permission);
    const group = capitalizeFirstLetter(entity);

    return {
      group,
      id: `${entity}::${permission}`,
      label,
    };
  });
};
