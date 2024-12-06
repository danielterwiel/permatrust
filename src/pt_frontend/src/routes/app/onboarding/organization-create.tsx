import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateOrganizationForm,
  type createOrganizationFormSchema,
} from '@/components/create-organization-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/organization/create',
)({
  beforeLoad: ({ context }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Create organization',
  }),
  loader: async ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateOrganization,
});

function CreateOrganization() {
  const { authActor } = Route.useLoaderData();
  const [_activeOrganizationId, setActiveOrganizationId] = useLocalStorage(
    'activeOrganizationId',
    '',
  );
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(
    values: z.infer<typeof createOrganizationFormSchema>,
  ) {
    try {
      setIsSubmitting(true);

      const { id: userId } = authActor.getSnapshot().context.user ?? {};
      if (!userId) {
        throw new Error('User not found');
      }

      const organizationId = await api.create_organization(values.name);
      setActiveOrganizationId(organizationId.toString());
      navigate({ to: '/projects' });
    } catch (_error) {
      // TODO: handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <CreateOrganizationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
  );
}
