import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { pt_backend } from '@/declarations/pt_backend';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute('/_authenticated/projects/create')({
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
  const navigate = useNavigate();
  const params = Route.useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const response = await pt_backend.create_project(
      BigInt(params.organisationId),
      values.name
    );
    const result = handleResult(response);
    navigate({
      to: `/projects/$projectId`,
      params: {
        projectId: result.toString(),
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create new project</CardTitle>
        <CardDescription>A new beginning</CardDescription>
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
                    <Input placeholder="Trial" {...field} />
                  </FormControl>
                  <FormDescription>This is your project name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
