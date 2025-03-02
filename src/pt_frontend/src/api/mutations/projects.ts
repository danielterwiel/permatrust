import { api } from '@/api';

import { createMutationHook } from '@/utils/createMutationHook';

export const createProjectMutations = () => {
  const useCreateProject = createMutationHook(
    api.create_project,
    (variables) => ({
      queries: [
        { queryKey: ['projects'] },
        { queryKey: ['projects_list'] },
        {
          exact: false,
          queryKey: [
            'projects_by_organization',
            { organization_id: variables.organization_id },
          ],
        },
      ],
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
