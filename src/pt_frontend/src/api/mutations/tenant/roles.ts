import { createMutationHook } from '@/utils/create-mutation-hook';

import type { CreateRoleInput } from '@/declarations/tenant_canister/tenant_canister.did.d';

import { api } from '@/api';

export const createRoleMutations = () => {
  const useCreateRole = createMutationHook(
    api.tenant.create_role,
    (variables: CreateRoleInput) => ({
      exact: false,
      queryKey: ['project_roles', { project_id: variables.project_id }],
    }),
    {
      successToast: {
        title: 'Role created',
      },
    },
  );

  const useUpdateRolePermissions = createMutationHook(
    api.tenant.update_role_permissions,
    (variables) => ({
      queries: [
        {
          exact: false,
          queryKey: ['role', { id: variables.role_id }],
        },
        { queryKey: ['user_roles'] },
        { queryKey: ['project_roles'] },
      ],
    }),
    {
      successToast: {
        title: 'Role permissions updated',
      },
    },
  );

  const useAssignRoles = createMutationHook(
    api.tenant.assign_roles,
    () => ({
      queries: [
        { queryKey: ['user_roles'] },
        { queryKey: ['project_roles'] },
        { queryKey: ['project_members_roles'] },
        { exact: false, queryKey: ['project_roles'] },
      ],
    }),
    {
      successToast: {
        title: 'Roles assigned',
      },
    },
  );

  return {
    useAssignRoles,
    useCreateRole,
    useUpdateRolePermissions,
  };
};
