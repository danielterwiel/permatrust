import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { tenantMutations as mutations } from '@/api/mutations';

import { CreateProjectForm } from '@/components/create-project-form';
import type { createProjectFormSchema } from '@/components/create-project-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create project',
  }),
  component: CreateProject,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateProject() {
  const navigate = useNavigate();

  const { isPending: isSubmitting, mutate: createProject } =
    mutations.useCreateProject();

  function onSubmit(values: z.infer<typeof createProjectFormSchema>) {
    try {
      createProject(
        {
          name: values.name,
        },
        {
          onSuccess: (projectId: number) => {
            navigate({
              params: {
                projectId,
              },
              to: '/projects/$projectId',
            });
          },
        },
      );
    } catch (_error) {
      // TODO: handle error
    }
  }

  return <CreateProjectForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
