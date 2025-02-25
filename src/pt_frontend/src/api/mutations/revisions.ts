import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { CreateRevisionInput } from '@/declarations/pt_backend/pt_backend.did';

export function useCreateRevision() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateRevisionInput) => api.create_revision(input),
    onSuccess: (_, variables) => {
      // Invalidate revisions and document queries
      queryClient.invalidateQueries({ queryKey: ['revisions'] });
      queryClient.invalidateQueries({ 
        queryKey: ['revisions_by_document', { document_id: variables.document_id }],
        exact: false 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['document', { id: variables.document_id }],
        exact: false 
      });
    },
  });
}