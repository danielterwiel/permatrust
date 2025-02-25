import { queryOptions } from '@tanstack/react-query';

import { api } from '@/api';

import type { 
  PaginationInput, 
  ProjectIdInput 
} from '@/declarations/pt_backend/pt_backend.did';

export const getWorkflowQueryOptions = (input: ProjectIdInput) =>
  queryOptions({
    queryFn: () => api.get_workflow(input),
    queryKey: ['workflow', input],
  });

export const getWorkflowDefinitionQueryOptions = (input: ProjectIdInput) =>
  queryOptions({
    queryFn: () => api.get_workflow_definition(input),
    queryKey: ['workflow_definition', input],
  });

export const getWorkflowStateQueryOptions = (input: ProjectIdInput) =>
  queryOptions({
    queryFn: () => api.get_workflow_state(input),
    queryKey: ['workflow_state', input],
  });

export const listWorkflowsQueryOptions = (input: PaginationInput) =>
  queryOptions({
    queryFn: () => api.list_workflows(input),
    queryKey: ['workflows', input],
  });