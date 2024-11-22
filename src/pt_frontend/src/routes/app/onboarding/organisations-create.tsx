import { api } from '@/api';
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import {
  CreateOrganisationForm,
  type createOrganisationFormSchema,
} from '@/components/create-organisation-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/organisations/create',
)({
  component: CreateOrganisation,
  beforeLoad: ({ context }) => ({
    getTitle: () => 'Create organisation',
    authActor: context.actors.auth,
  }),
  loader: async ({ context }) => ({
    authActor: context.actors.auth,
  }),
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
