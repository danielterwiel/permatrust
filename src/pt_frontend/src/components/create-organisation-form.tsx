import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';
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
import type { FC } from 'react';

export const createOrganisationFormSchema = z.object({
  name: z.string().min(2, {
    message: 'Organisation name must be at least 2 characters.',
  }),
});

type CreateOrganisationFormProps = {
  onSubmit: (values: z.infer<typeof createOrganisationFormSchema>) => void;
  isSubmitting: boolean;
};

export const CreateOrganisationForm: FC<CreateOrganisationFormProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const form = useForm<z.infer<typeof createOrganisationFormSchema>>({
    resolver: zodResolver(createOrganisationFormSchema),
    defaultValues: {
      name: '',
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="building-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Create new organisation
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
