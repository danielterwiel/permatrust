import { useForm } from '@tanstack/react-form';
import { z } from 'zod';

import { Loading } from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
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

export type CreateOrganizationFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createOrganizationFormSchema>) => void;
};

export const CreateOrganizationForm: FC<CreateOrganizationFormProps> = ({
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
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
        <form
          className="space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="name"
            validators={{
              onChange: ({ value }) => {
                try {
                  createOrganizationFormSchema.parse({ name: value });
                  return undefined;
                } catch (error) {
                  if (error instanceof z.ZodError) {
                    return error.errors?.[0]?.message;
                  }
                  return 'Invalid input';
                }
              },
            }}
          >
            {(field) => (
              <FormItem>
                <FormLabel field={field}>Name</FormLabel>
                <FormControl field={field}>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="e.g. Acme"
                    value={field.state.value}
                  />
                </FormControl>
                <FormDescription>
                  This is your organization name.
                </FormDescription>
                <FormMessage field={field} />
              </FormItem>
            )}
          </form.Field>

          <form.Subscribe selector={(state) => [state.isSubmitting]}>
            {([submitting]) =>
              isSubmitting || submitting ? (
                <Button disabled={true}>
                  <Loading text="Creating..." />
                </Button>
              ) : (
                <Button type="submit">Create organization</Button>
              )
            }
          </form.Subscribe>
        </form>
      </CardContent>
    </Card>
  );
};
