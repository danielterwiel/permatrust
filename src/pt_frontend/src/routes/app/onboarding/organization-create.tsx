import { createFileRoute } from '@tanstack/react-router';

import { CreateOrganizationForm } from '@/components/create-organization-form';
import type { createOrganizationFormSchema } from '@/components/create-organization-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/organization/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create organization',
  }),
  loader: ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateOrganization,
});

function CreateOrganization() {
  const { authActor } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  function onSubmit(
    organization: z.infer<typeof createOrganizationFormSchema>,
  ) {
    authActor.send({
      type: 'UPDATE_ORGANIZATION',
      organization,
    });
    navigate({ to: '/onboarding/project/create' });
  }

  return <CreateOrganizationForm isSubmitting={false} onSubmit={onSubmit} />;
}
