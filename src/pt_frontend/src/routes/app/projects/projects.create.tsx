import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateProjectForm,
  type createProjectFormSchema,
} from '@/components/create-project-form';

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
