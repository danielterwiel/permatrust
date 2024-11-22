import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { Loading } from '@/components/Loading';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  onSubmit: (values: z.infer<typeof createUserFormSchema>) => void;
  isSubmitting: boolean;
};

export const CreateUserForm: FC<CreateUserFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof createUserFormSchema>>({
    resolver: zodResolver(createUserFormSchema),
    disabled: isSubmitting,
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="users-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Create new user
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
