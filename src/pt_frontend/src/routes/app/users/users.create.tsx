import { api } from '@/api';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import {
  CreateUserForm,
  type createUserFormSchema,
} from '@/components/create-user-form';
import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/create',
)({
  component: CreateUser,
  beforeLoad: () => {
    return {
      getTitle: () => 'Create user',
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function CreateUser() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = Route.useNavigate();

  async function onSubmit(values: z.infer<typeof createUserFormSchema>) {
    try {
      setIsSubmitting(true);
      await api.create_user(values.first_name, values.last_name);
      navigate({ to: '/organisations' });
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return <CreateUserForm onSubmit={onSubmit} isSubmitting={isSubmitting} />;
}
