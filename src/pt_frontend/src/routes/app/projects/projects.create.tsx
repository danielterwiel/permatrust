import { api } from '@/api';
import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import {
  CreateProjectForm,
  type createProjectFormSchema,
} from '@/components/create-project-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/create',
)({
  component: CreateProject,
  beforeLoad: () => ({
    getTitle: () => 'Create project',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateProject() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrganisationId] = useLocalStorage('activeOrganisationId', '');
  const navigate = useNavigate();

  async function onSubmit(values: z.infer<typeof createProjectFormSchema>) {
    setIsSubmitting(true);
    try {
      const projectId = await api.create_project(
        BigInt(activeOrganisationId),
        values.name,
      );
      navigate({
        to: '/projects/$projectId',
        params: {
          projectId: projectId.toString(),
        },
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <CreateProjectForm onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
