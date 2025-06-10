import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { tryCatch } from '@/utils/try-catch';

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
    mutations.tenant.useCreateProject();

  async function onSubmit(values: z.infer<typeof createProjectFormSchema>) {
    const result = await tryCatch(
      createProject({
        name: values.name,
      }),
    );

    if (result.error) {
      // TODO: handle error
      console.error('Error creating project:', result.error);
      return;
    }

    navigate({
      params: {
        projectId: result.data,
      },
      to: '/projects/$projectId',
    });
  }

  return <CreateProjectForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
