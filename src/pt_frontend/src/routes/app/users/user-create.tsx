import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';

import { CreateUserForm } from '@/components/create-user-form';
import type { createUserFormSchema } from '@/components/create-user-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create user',
  }),
  component: CreateUser,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateUser() {
  const navigate = Route.useNavigate();

  const { isPending: isSubmitting, mutate: createUser } =
    mutations.useCreateUser();

  function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    try {
      createUser(
        {
          first_name: values.first_name,
          last_name: values.last_name,
          organizations: [],
        },
        {
          onSuccess: () => {
            navigate({ to: '/organizations' });
          },
        },
      );
    } catch (_error) {
      // TODO: handle error
    }
  }

  return <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
