import { api } from '@/api';
import { createQueryOptions } from '@/utils/create-query-options';

import type {
  PaginationInput,
  ProjectIdInput,
} from '@/declarations/pt_backend/pt_backend.did';

export const getWorkflowOptions = (input: ProjectIdInput) =>
  createQueryOptions({
    queryFn: () => api.get_workflow(input),
    queryKey: ['workflow', input],
  });

export const getWorkflowStateOptions = (input: ProjectIdInput) =>
  createQueryOptions({
    queryFn: () => api.get_workflow_state(input),
    queryKey: ['workflow_state', input],
  });

export const listWorkflowsOptions = (input: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_workflows(input),
    queryKey: ['workflows', input],
  });
