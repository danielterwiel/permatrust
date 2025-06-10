import { createMutationHook } from '@/utils/create-mutation-hook';

import { api } from '@/api';

export const createProjectMutations = () => {
  const useCreateProject = createMutationHook(
    api.tenant.create_project,
    () => ({
      queries: [{ queryKey: ['projects_list'] }],
    }),
    {
      successToast: {
        title: 'Project created',
      },
    },
  );

  return {
    useCreateProject,
  };
};
