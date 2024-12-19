import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

import { api } from '@/api';

import {
  CreateUserForm,
  type createUserFormSchema,
} from '@/components/create-user-form';

import type { z } from 'zod';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/create',
)({
  beforeLoad: () => {
    return {
      getTitle: () => 'Create user',
    };
  },
  component: CreateUser,
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
      await api.create_user(values.first_name, values.last_name, []);
      navigate({ to: '/organizations' });
      setIsSubmitting(false);
    } catch (_error) {
      // TODO: handle error
    } finally {
      setIsSubmitting(false);
    }
  }

  return <CreateUserForm isSubmitting={isSubmitting} onSubmit={onSubmit} />;
}
