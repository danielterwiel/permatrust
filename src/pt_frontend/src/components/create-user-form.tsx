import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { Input } from '@/components/input';
import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon';

import type { FC } from 'react';

export const createUserFormSchema = z.object({
  first_name: z.string().min(1, {
    message: 'First name must be at least 1 character.',
  }),
  last_name: z.string().min(1, {
    message: 'Last name must be at least 1 character.',
  }),
});

type CreateUserFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createUserFormSchema>) => void;
};

export const CreateUserForm: FC<CreateUserFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues: {
      first_name: '',
      last_name: '',
    },
    onSubmit: async ({ value }) => {
      createUserFormSchema.parse(value);
      onSubmit(value);
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="users-outline"
            size="lg"
          />
          Create new user
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <form.Field name="first_name">
            {(field) => (
              <FormItem>
                <FormLabel field={field}>First name</FormLabel>
                <FormControl field={field}>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="e.g. Peter"
                    value={field.state.value}
                  />
                </FormControl>
                <FormDescription>Your first name.</FormDescription>
                <FormMessage field={field} />
              </FormItem>
            )}
          </form.Field>

          <form.Field name="last_name">
            {(field) => (
              <FormItem>
                <FormLabel field={field}>Last name</FormLabel>
                <FormControl field={field}>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="e.g. Raksis"
                    value={field.state.value}
                  />
                </FormControl>
                <FormDescription>Your last name.</FormDescription>
                <FormMessage field={field} />
              </FormItem>
            )}
          </form.Field>

          {isSubmitting ? (
            <Button disabled={true}>
              <Loading text="Creating..." />
            </Button>
          ) : (
            <Button type="submit">Create user</Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
