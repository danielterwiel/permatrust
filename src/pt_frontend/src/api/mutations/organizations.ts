import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { CreateOrganizationInput } from '@/declarations/pt_backend/pt_backend.did';

export function useCreateOrganization() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateOrganizationInput) => api.create_organization(input),
    onSuccess: () => {
      // Invalidate organizations queries
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
  });
}