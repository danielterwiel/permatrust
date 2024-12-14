import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateUserForm,
  type createUserFormSchema,
} from '@/components/create-user-form';

import type { CreateUserInput } from '@/declarations/pt_backend/pt_backend.did';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/user/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create user',
  }),
  loader: async ({ context }) => ({
    authActor: context.actors.auth,
  }),
  component: CreateUser,
});

function CreateUser() {
  const { authActor } = Route.useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<Error | undefined>();
  const navigate = Route.useNavigate();

  async function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    try {
      setIsSubmitting(true);
      const input = {
        first_name: values.first_name,
        last_name: values.last_name,
      } satisfies CreateUserInput;

      const user = await api.create_user(input);
      authActor.send({
        type: 'UPDATE_USER',
        user,
      });
      navigate({ to: '/onboarding/organization/create' });
      setIsSubmitting(false);
    } catch (error) {
      if (error instanceof Error) {
        setError(error);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {error && <div>{error.message}</div>}
      <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />
    </>
  );
}
