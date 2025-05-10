import { createFileRoute } from '@tanstack/react-router';

import { tenantMutations as mutations } from '@/api/mutations';

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
        },
        {
          onSuccess: () => {
            navigate({ to: '/organization' });
          },
        },
      );
    } catch (_error) {
      // TODO: handle error
    }
  }

  return <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
