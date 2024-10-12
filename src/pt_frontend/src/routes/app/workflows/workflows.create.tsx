import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { handleResult } from '@/utils/handleResult';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/workflows/create')({
  beforeLoad: () => ({
    getTitle: () => 'Create workflow',
  }),
  component: CreateWorkflow,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Workflow must be at least 2 characters.',
  }),
  graphJson: z.string().min(3, {
    message: 'Graph JSON must be at least 3 characters.',
  }),
});

const graphJson = JSON.stringify({
  id: 'light',
  initial: 'green',
  states: {
    green: {
      on: {
        TIMER: 'yellow',
      },
    },
    yellow: {
      on: {
        TIMER: 'red',
      },
    },
    red: {
      on: {
        TIMER: 'green',
      },
    },
  },
});

export function CreateWorkflow() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      graphJson: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);

    const response = await pt_backend.create_workflow({
      project_id: BigInt(0), // TODO: impl Picker
      name: values.name,
      graph_json: graphJson,
      initial_state: 'HOAX',
    });
    const result = handleResult(response);
    setIsSubmitting(false);
    navigate({
      to: `/workflows/$workflowId`,
      params: {
        workflowId: result.toString(),
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new workflow</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="CAPA" {...field} />
                  </FormControl>
                  <FormDescription>This is your workflow name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">
              {isSubmitting ? (
                <Button disabled={true}>
                  <Loading text="Submitting..." className="place-items-start" />
                </Button>
              ) : (
                'Submit'
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
