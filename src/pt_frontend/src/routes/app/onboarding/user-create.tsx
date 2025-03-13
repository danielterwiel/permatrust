import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
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

  const {
    error,
    isPending: isSubmitting,
    mutate: createUser,
  } = mutations.useCreateUser();

  function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    createUser(
      {
        first_name: values.first_name,
        last_name: values.last_name,
        organizations: [], // TODO: invite codes
      },
      {
        onSuccess: (user) => {
          authActor.send({
            type: 'UPDATE_USER',
            user,
          });
          navigate({ to: '/onboarding/organization/create' });
        },
      },
    );
  }

  return (
    <>
      {error && <div>{error.message}</div>}
      <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  );
}
