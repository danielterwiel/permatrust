import { api } from '@/api';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  CreateUserForm,
  type createUserFormSchema,
} from '@/components/create-user-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/users/create',
)({
  component: CreateUser,
  beforeLoad: () => ({
    getTitle: () => 'Create user',
  }),
  loader: async ({ context }) => ({
    authActor: context.actors.auth,
  }),
});

function CreateUser() {
  const { authActor } = Route.useLoaderData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = Route.useNavigate();

  async function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    try {
      setIsSubmitting(true);
      const id = await api.create_user(values.first_name, values.last_name);
      authActor.send({
        type: 'UPDATE_USER',
        user: {
          id,
          first_name: values.first_name,
          last_name: values.last_name,
          organisations: [],
        },
      });
      navigate({ to: '/onboarding/organisations/create' });
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <CreateUserForm onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
