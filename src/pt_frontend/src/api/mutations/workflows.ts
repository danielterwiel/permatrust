import { useMutation, useQueryClient } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  CreateWorkflowInput, 
  ExecuteWorkflowInput 
} from '@/declarations/pt_backend/pt_backend.did';

export function useCreateWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: CreateWorkflowInput) => api.create_workflow(input),
    onSuccess: (_, variables) => {
      // Invalidate workflows queries
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      // Invalidate project workflows
      queryClient.invalidateQueries({ 
        queryKey: ['project', { project_id: variables.project_id }],
        exact: false 
      });
    },
  });
}

export function useExecuteWorkflow() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (input: ExecuteWorkflowInput) => api.execute_workflow(input),
    onSuccess: (_, variables) => {
      // Invalidate workflow state
      queryClient.invalidateQueries({ 
        queryKey: ['workflow_state', { id: variables.workflow_id }],
        exact: false 
      });
      // Invalidate the workflow itself
      queryClient.invalidateQueries({ 
        queryKey: ['workflow', { id: variables.workflow_id }],
        exact: false 
      });
    },
  });
}