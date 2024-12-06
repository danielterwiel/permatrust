import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

import type { FC } from 'react';

export const createUserFormSchema = z.object({
  first_name: z.string().min(1, {
    message: 'First name must be at least 1 character.',
  }),
  last_name: z.string().min(1, {
    message: 'Last name must be at least 1 character.',
  }),
});

export type CreateUserFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createUserFormSchema>) => void;
};

export const CreateUserForm: FC<CreateUserFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof createUserFormSchema>>({
    defaultValues: {
      first_name: '',
      last_name: '',
    },
    disabled: isSubmitting,
    resolver: zodResolver(createUserFormSchema),
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
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Peter" {...field} />
                  </FormControl>
                  <FormDescription>Your first name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="last_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Raksis" {...field} />
                  </FormControl>
                  <FormDescription>Your last name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSubmitting ? (
              <Button disabled={true}>
                <Loading text="Creating..." />
              </Button>
            ) : (
              <Button type="submit">Create user</Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
