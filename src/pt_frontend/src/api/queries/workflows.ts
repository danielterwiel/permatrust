import { createPagination } from '@/schemas/pagination';
import { createQueryOptions } from '@/utils/create-query-options';

import { getSingleApiResult } from '../utils/get-single-api-result';

import { ENTITY } from '@/consts/entities';
import {
  FIELDS,
  FILTER_OPERATOR,
  PAGE_SIZE,
  SORT_ORDER,
} from '@/consts/pagination';

import type { PaginationInput } from '@/declarations/pt_backend/pt_backend.did';
import type { WorkflowId } from '@/types/entities';

import { api } from '@/api';

export const getWorkflowOptions = (id: WorkflowId) => {
  const pagination = createPagination(ENTITY.WORKFLOW, {
    defaultFilterField: FIELDS.WORKFLOW.ID,
    defaultFilterOperator: FILTER_OPERATOR.EQUALS,
    defaultFilterValue: id.toString(),
    defaultSortField: FIELDS.WORKFLOW.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
    pageSize: PAGE_SIZE.SINGLE,
  });

  return createQueryOptions({
    queryFn: async () =>
      getSingleApiResult(
        () => api.list_workflows(pagination),
        'Workflow not found',
      ),
    queryKey: ['workflow', { id, pagination }],
  });
};

export const getWorkflowStateOptions = (id: WorkflowId) =>
  createQueryOptions({
    queryFn: () => api.get_workflow_state({ id }),
    queryKey: ['workflow_state', id],
  });

export const listWorkflowsOptions = (input: PaginationInput) =>
  createQueryOptions({
    queryFn: () => api.list_workflows(input),
    queryKey: ['workflows', input],
  });
