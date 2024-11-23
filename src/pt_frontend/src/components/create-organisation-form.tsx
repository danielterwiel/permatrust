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

export const createOrganisationFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Organisation name must be at least 2 characters.',
  }),
});

type CreateOrganisationFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createOrganisationFormSchema>) => void;
};

export const CreateOrganisationForm: FC<CreateOrganisationFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof createOrganisationFormSchema>>({
    defaultValues: {
      name: '',
    },
    resolver: zodResolver(createOrganisationFormSchema),
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
          Create new organisation
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
                    This is your organisation name.
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
                Create organisation
              </Button>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
