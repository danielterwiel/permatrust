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
import type { FC } from 'react';

export const createProjectFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
});

type CreateProjectFormProps = {
  onSubmit: (values: z.infer<typeof createProjectFormSchema>) => void;
  isSubmitting: boolean;
};

export const CreateProjectForm: FC<CreateProjectFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof createProjectFormSchema>>({
    resolver: zodResolver(createProjectFormSchema),
    disabled: isSubmitting,
    defaultValues: {
      name: '',
    },
  });

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
};
