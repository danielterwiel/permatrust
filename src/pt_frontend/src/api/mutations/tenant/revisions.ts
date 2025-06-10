import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createRevisionMutations = () => {
  const useCreateRevision = createMutationHook(
    api.tenant.create_revision,
    (variables) => ({
      queries: [
        { queryKey: ['revisions'] },
        {
          exact: false,
          queryKey: [
            'revisions_by_document',
            { document_id: variables.document_id },
          ],
        },
        {
          exact: false,
          queryKey: ['document', { id: variables.document_id }],
        },
      ],
    }),
    {
      successToast: false, // Disable automatic toast - will be shown manually after all uploads complete
    },
  );

  return {
    useCreateRevision,
  };
};
