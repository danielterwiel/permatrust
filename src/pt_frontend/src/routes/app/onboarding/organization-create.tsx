import { useLocalStorage } from '@/hooks/use-local-storage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';

import { CreateOrganizationForm } from '@/components/create-organization-form';

import type { createOrganizationFormSchema } from '@/components/create-organization-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/organization/create',
)({
  beforeLoad: ({ context }) => ({
    authActor: context.actors.auth,
    getTitle: () => 'Create organization',
  }),
  loader: ({ context }) => ({
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

  const {
    error,
    isPending: isSubmitting,
    mutate: createOrganization,
  } = mutations.useCreateOrganization();

  async function onSubmit(
    values: z.infer<typeof createOrganizationFormSchema>,
  ) {
    const { id: userId } = authActor.getSnapshot().context.user ?? {};

    if (userId === undefined) {
      throw new Error('User not found');
    }

    createOrganization(
      {
        name: values.name,
      },
      {
        onSuccess: (organizationId) => {
          setActiveOrganizationId(organizationId.toString());
          navigate({ to: '/projects' });
        },
      },
    );
  }

  return (
    <>
      {error && <div>{error.message}</div>}
      <CreateOrganizationForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  );
}
