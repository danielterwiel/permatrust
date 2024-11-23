import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateOrganisationForm,
  type createOrganisationFormSchema,
} from '@/components/create-organisation-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organisations/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create organisation',
  }),
  component: CreateOrganisation,
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
    } catch (_error) {
      // TODO: handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateOrganisationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
  );
}
