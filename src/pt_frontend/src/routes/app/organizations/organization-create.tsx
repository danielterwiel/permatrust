import { useLocalStorage } from '@/hooks/use-local-storage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';

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
  const { isPending: isSubmitting, mutate: createOrganization } =
    mutations.useCreateOrganization();

  async function onSubmit(
    values: z.infer<typeof createOrganizationFormSchema>,
  ) {
    try {
      createOrganization(
        {
          name: values.name,
        },
        {
          onSuccess: (organizationId) => {
            setActiveOrganizationId(organizationId.toString());
            navigate({
              to: `/organizations/${organizationId.toString()}`,
            });
          },
        },
      );
    } catch (_error) {
      // TODO: handle error
    }
  }

  return (
    <CreateOrganizationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
  );
}
