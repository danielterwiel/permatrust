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

export const createOrganizationFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Organization name must be at least 2 characters.',
  }),
});

type CreateOrganizationFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createOrganizationFormSchema>) => void;
};

export const CreateOrganizationForm: FC<CreateOrganizationFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof createOrganizationFormSchema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createOrganizationFormSchema),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="building-outline"
            size="lg"
          />
          Create new organization
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
                    <Input placeholder="e.g. Acme" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your organization name.
                  </FormDescription>
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
                Create organization
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
