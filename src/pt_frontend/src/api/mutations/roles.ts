import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  RoleInput, 
  UpdateRolePermissionsInput 
} from '@/declarations/pt_backend/pt_backend.did';

export function useCreateRole() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: RoleInput) => api.create_role(input),
    onSuccess: (_, variables) => {
      // Invalidate roles for this project
      queryClient.invalidateQueries({ 
        queryKey: ['project_roles', { project_id: variables.project_id }],
        exact: false 
      });
    },
  });
}

export function useUpdateRolePermissions() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: UpdateRolePermissionsInput) => api.update_role_permissions(input),
    onSuccess: (_, variables) => {
      // Invalidate related roles
      queryClient.invalidateQueries({ 
        queryKey: ['role', { id: variables.role_id }],
        exact: false 
      });
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      queryClient.invalidateQueries({ queryKey: ['project_roles'] });
    },
  });
}