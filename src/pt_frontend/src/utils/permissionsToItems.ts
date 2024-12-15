import { capitalizeFirstLetter, splitOnUpperCase } from '@/utils';

import type { EntityPermissionsResult } from '@/declarations/pt_backend/pt_backend.did';

export const permissionsToItems = (permissions: EntityPermissionsResult) =>
  Object.entries(permissions).flatMap(([entity, entityPermissions]) =>
    entityPermissions.flatMap((permission: string) => {
      const labelSplit = splitOnUpperCase(permission);
      const label = capitalizeFirstLetter(labelSplit.toLowerCase());
      const group = capitalizeFirstLetter(entity);
      return {
        group,
        id: `${entity}::${permission}`,
        label,
      };
    }),
  );
