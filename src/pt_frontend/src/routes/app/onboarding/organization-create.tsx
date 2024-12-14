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
    authActor: context.authActor,
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
  const [error, setError] = useState<Error | undefined>();

  async function onSubmit(
    values: z.infer<typeof createOrganizationFormSchema>,
  ) {
    try {
      setIsSubmitting(true);

      const { id: userId } = authActor.getSnapshot().context.user ?? {};

      if (userId === undefined) {
        throw new Error('User not found');
      }

      const organizationId = await api.create_organization(values.name);
      setActiveOrganizationId(organizationId.toString());
      navigate({ to: '/projects' });
    } catch (submitError) {
      if (submitError instanceof Error) {
        setError(submitError);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {error && <div>{error.message}</div>}
      <CreateOrganizationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  );
}
