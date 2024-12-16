import { capitalizeFirstLetter, pascalToHumanReadable } from '@/utils';

import type { EntityPermission } from '@/declarations/pt_backend/pt_backend.did';

export const permissionsToItems = (permissions: EntityPermission[]) => {
  return Object.entries(permissions).flatMap(([_, entityPermission]) => {
    const [entityVariant] = Object.entries(entityPermission);

    if (!entityVariant) {
      throw new Error('Empty Entity Permission variant');
    }

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
