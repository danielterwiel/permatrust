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
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useState } from 'react';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/create',
)({
  component: CreateProject,
  beforeLoad: () => ({
    getTitle: () => 'Create project',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
});

export function CreateProject() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeOrganisationId] = useLocalStorage('activeOrganisationId', '');
  const navigate = useNavigate();
  const { api } = Route.useRouteContext({
    select: ({ api }) => ({ api }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const projectId = await api.call.create_project(
        BigInt(activeOrganisationId),
        values.name,
      );
      navigate({
        to: '/projects/$projectId',
        params: {
          projectId: projectId.toString(),
        },
      });
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
            name="briefcase-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Create new project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Clinical trial" {...field} />
                  </FormControl>
                  <FormDescription>This is your project name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            {isSubmitting ? (
              <Button disabled={true}>
                <Loading text="Creating..." />
              </Button>
            ) : (
              <Button type="submit" disabled={isSubmitting}>
                Create
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
