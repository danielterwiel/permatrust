import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Loading } from '@/components/Loading';
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
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';

import type { FC } from 'react';

export const createProjectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
});

type CreateProjectFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createProjectFormSchema>) => void;
};

export const CreateProjectForm: FC<CreateProjectFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof createProjectFormSchema>>({
    defaultValues: {
      name: '',
    },
    disabled: isSubmitting,
    resolver: zodResolver(createProjectFormSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="briefcase-outline"
            size="lg"
          />
          Create new project
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
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
              <Button disabled={isSubmitting} type="submit">
                Create
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
