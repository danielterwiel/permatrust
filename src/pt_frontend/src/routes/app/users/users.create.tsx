import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
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
import { pt_backend } from '@/declarations/pt_backend';
import { useState } from 'react';

export const Route = createFileRoute('/_authenticated/users/create')({
  component: CreateProject,
  beforeLoad: () => ({
    getTitle: () => 'Create user',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  first_name: z.string().min(1, {
    message: 'First name must be at least 1 character.',
  }),
  last_name: z.string().min(1, {
    message: 'Last name must be at least 1 character.',
  }),
});

export function CreateProject() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      first_name: '',
      last_name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      await pt_backend.create_user(values.first_name, values.last_name);
      navigate({ to: `/organisations` });
      setIsSubmitting(false);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
                    <Input placeholder="e.g. John" {...field} />
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
                    <Input placeholder="e.g. Hooks" {...field} />
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
}
