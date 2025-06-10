import { useForm } from '@tanstack/react-form';
import type { FC } from 'react';
import { z } from 'zod';

import { capitalizeFirstLetterValidator } from '@/schemas/form';
import { createZodFieldValidator } from '@/utils/create-zod-field-validator';

import { Input } from '@/components/input';
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
  const form = useForm({
    defaultValues: {
      name: '',
    },
    onSubmit: ({ value }) => {
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
              onChange: capitalizeFirstLetterValidator,
              onSubmit: createZodFieldValidator(
                createOrganizationFormSchema,
                'name',
              ),
            }}
          >
            {(field) => (
              <FormItem>
                <FormLabel field={field}>Name</FormLabel>
                <FormControl field={field}>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
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
