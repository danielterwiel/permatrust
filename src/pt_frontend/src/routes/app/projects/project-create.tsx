import { useLocalStorage } from '@/hooks/use-local-storage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';

import {
  CreateProjectForm,
  type createProjectFormSchema,
} from '@/components/create-project-form';

import { organizationIdSchema } from '@/schemas/entities';

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
  const [activeOrganizationId] = useLocalStorage('activeOrganizationId', '');
  const navigate = useNavigate();

  const { isPending: isSubmitting, mutate: createProject } =
    mutations.useCreateProject();

  async function onSubmit(values: z.infer<typeof createProjectFormSchema>) {
    try {
      const activeOrganizationIdNumber =
        organizationIdSchema.parse(activeOrganizationId);

      createProject(
        {
          name: values.name,
          organization_id: activeOrganizationIdNumber,
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
