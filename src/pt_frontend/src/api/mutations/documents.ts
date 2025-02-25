import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { CreateDocumentInput } from '@/declarations/pt_backend/pt_backend.did';

export function useCreateDocument() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => api.create_document(input),
    onSuccess: (_, variables) => {
      // Invalidate document-related queries
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ 
        queryKey: ['documents_by_project', { project_id: variables.project_id }],
        exact: false 
      });
      // Also invalidate project as it maintains a list of documents
      queryClient.invalidateQueries({ 
        queryKey: ['project', { project_id: variables.project_id }],
        exact: false 
      });
    },
  });
}