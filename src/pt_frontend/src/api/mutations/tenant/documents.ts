import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createDocumentMutations = () => {
  const useCreateDocument = createMutationHook(
    api.tenant.create_document,
    (variables) => ({
      queries: [
        { queryKey: ['documents'] },
        {
          exact: false,
          queryKey: [
            'documents_by_project',
            { project_id: variables.project_id },
          ],
        },
        {
          exact: false,
          queryKey: ['project', { project_id: variables.project_id }],
        },
      ],
    }),
    {
      successToast: {
        title: 'Document created',
      },
    },
  );

  return {
    useCreateDocument,
  };
};
