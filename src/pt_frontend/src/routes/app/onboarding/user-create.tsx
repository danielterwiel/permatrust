import { createFileRoute } from '@tanstack/react-router';

import { CreateUserForm } from '@/components/create-user-form';
import type { createUserFormSchema } from '@/components/create-user-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/user/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create user',
  }),
  loader: ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateUser,
});

function CreateUser() {
  const { authActor } = Route.useLoaderData();
  const navigate = Route.useNavigate();

  function onSubmit(user: z.infer<typeof createUserFormSchema>) {
    authActor.send({
      type: 'UPDATE_USER',
      user,
    });
    return navigate({ to: '/onboarding/organization/create' });
  }

  return <CreateUserForm isSubmitting={false} onSubmit={onSubmit} />;
}
