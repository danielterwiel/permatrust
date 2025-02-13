import { useLocalStorage } from '@/hooks/use-local-storage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateProjectForm,
  type createProjectFormSchema,
} from '@/components/create-project-form';

import { toNumberSchema } from '@/schemas/primitives';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrganizationId] = useLocalStorage('activeOrganizationId', '');
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof createProjectFormSchema>) {
    setIsSubmitting(true);
    try {
      const activeOrganizationIdNumber =
        toNumberSchema.parse(activeOrganizationId);
      const projectId = await api.create_project({
        name: values.name,
        organization_id: activeOrganizationIdNumber,
      });
      navigate({
        params: {
          projectId: projectId.toString(),
        },
        to: '/projects/$projectId',
      });
    } catch (_error) {
      // TODO: handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return <CreateProjectForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
