import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { CreateUserInput, AssignRolesInput } from '@/declarations/pt_backend/pt_backend.did';

export function useCreateUser() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateUserInput) => api.create_user(input),
    onSuccess: () => {
      // Invalidate user-related queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}

export function useAssignRoles() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: AssignRolesInput) => api.assign_roles(input),
    onSuccess: () => {
      // Invalidate role assignments
      queryClient.invalidateQueries({ queryKey: ['user_roles'] });
      queryClient.invalidateQueries({ queryKey: ['project_members_roles'] });
    },
  });
}