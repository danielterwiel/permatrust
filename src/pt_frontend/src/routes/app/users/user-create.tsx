import { createFileRoute } from '@tanstack/react-router';

import { mutations } from '@/api/mutations';
import { tryCatch } from '@/utils/try-catch';

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
    mutations.tenant.useCreateUser();

  async function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    const result = await tryCatch(
      createUser({
        first_name: values.first_name,
        last_name: values.last_name,
      })
    );

    if (result.error) {
      // TODO: handle error
      console.error('Error creating user:', result.error);
      return;
    }

    navigate({ to: '/organization' });
  }

  return <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
