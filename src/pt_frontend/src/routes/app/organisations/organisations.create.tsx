import { api } from '@/api';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  type createOrganisationFormSchema,
  CreateOrganisationForm,
} from '@/components/create-organisation-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organisations/create',
)({
  component: CreateOrganisation,
  beforeLoad: () => ({
    getTitle: () => 'Create organisation',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateOrganisation() {
  const [_activeOrganisationId, setActiveOrganisationId] = useLocalStorage(
    'activeOrganisationId',
    '',
  );
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(
    values: z.infer<typeof createOrganisationFormSchema>,
  ) {
    try {
      setIsSubmitting(true);
      const organisationId = await api.create_organisation(values.name);
      setActiveOrganisationId(organisationId.toString());
      navigate({
        to: `/organisations/${organisationId.toString()}`,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateOrganisationForm onSubmit={onSubmit} isSubmitting={isSubmitting} />
  );
}
