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
  '/_initialized/_authenticated/_onboarding/onboarding/organisations/create',
)({
  beforeLoad: ({ context }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Create organisation',
  }),
  loader: async ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateOrganisation,
});

function CreateOrganisation() {
  const { authActor } = Route.useLoaderData();
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

      const { id: userId } = authActor.getSnapshot().context.user ?? {};
      if (!userId) {
        throw new Error('User not found');
      }

      const organisationId = await api.create_organisation(values.name);
      setActiveOrganisationId(organisationId.toString());
      navigate({ to: '/projects' });
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
