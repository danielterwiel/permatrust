import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createWorkflowMutations = () => {
  const useCreateWorkflow = createMutationHook(
    api.tenant.create_workflow,
    (variables) => ({
      queries: [
        { queryKey: ['workflows'] },
        {
          exact: false,
          queryKey: ['project', { project_id: variables.project_id }],
        },
      ],
    }),
    {
      successToast: {
        title: 'Workflow created',
      },
    },
  );

  const useExecuteWorkflow = createMutationHook(
    api.tenant.execute_workflow,
    (variables) => ({
      queries: [
        {
          exact: false,
          queryKey: ['workflow_state', { id: variables.workflow_id }],
        },
        {
          exact: false,
          queryKey: ['workflow', { id: variables.workflow_id }],
        },
      ],
    }),
    {
      successToast: {
        title: 'Workflow executed',
      },
    },
  );

  return {
    useCreateWorkflow,
    useExecuteWorkflow,
  };
};
