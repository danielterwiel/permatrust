import { useLocalStorage } from '@/hooks/use-local-storage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateOrganizationForm,
  type createOrganizationFormSchema,
} from '@/components/create-organization-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create organization',
  }),
  component: CreateOrganization,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateOrganization() {
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
      const organizationId = await api.create_organization({
        name: values.name,
      });
      setActiveOrganizationId(organizationId.toString());
      navigate({
        to: `/organizations/${organizationId.toString()}`,
      });
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
