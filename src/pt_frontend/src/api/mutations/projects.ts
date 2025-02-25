import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { CreateProjectInput } from '@/declarations/pt_backend/pt_backend.did';

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateProjectInput) => api.create_project(input),
    onSuccess: (_, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['projects_list'] });
      queryClient.invalidateQueries({ 
        queryKey: ['projects_by_organization', { organization_id: variables.organization_id }],
        exact: false 
      });
    },
  });
}