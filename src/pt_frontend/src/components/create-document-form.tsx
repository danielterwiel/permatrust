import { useForm } from '@tanstack/react-form';
import type { FC } from 'react';
import { z } from 'zod';

import { createZodFieldValidator } from '@/utils/create-zod-field-validator';

import { ContentForm } from '@/components/content-form';
import { Input } from '@/components/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  FormControl,
  FormDescription,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Icon } from '@/components/ui/icon';

import type { RevisionContent } from '@/declarations/tenant_canister/tenant_canister.did';

export const createDocumentFormSchema = z.object({
  title: z.string().min(2, {
    message: 'Document title must be at least 2 characters.',
  }),
});

type CreateDocumentFormProps = {
  isSubmitting: boolean;
  onSubmit: (
    title: string,
    contents: Array<RevisionContent>,
    largeContents: Array<RevisionContent>,
  ) => Promise<{ revisionId: bigint } | null>;
  onSubmitComplete: () => void;
};

export const CreateDocumentForm: FC<CreateDocumentFormProps> = ({
  isSubmitting,
  onSubmit,
  onSubmitComplete,
}) => {
  const titleForm = useForm({
    defaultValues: {
      title: '',
    },
  });

  const handleContentSubmit = async (
    contents: Array<RevisionContent>,
    largeContents: Array<RevisionContent>,
  ) => {
    const title = titleForm.state.values.title;

    // Validate title
    const titleValidation = createDocumentFormSchema.safeParse({ title });
    if (!titleValidation.success) {
      console.error('Title validation failed:', titleValidation.error);
      return null;
    }

    return await onSubmit(title, contents, largeContents);
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Create new document</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-outline"
              size="lg"
            />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          <titleForm.Field
            name="title"
            validators={{
              onSubmit: createZodFieldValidator(
                createDocumentFormSchema,
                'title',
              ),
            }}
          >
            {(field) => (
              <FormItem>
                <FormLabel field={field}>Title</FormLabel>
                <FormControl field={field}>
                  <Input
                    onBlur={field.handleBlur}
                    onChange={(value) => field.handleChange(value)}
                    placeholder="e.g. Project Documentation"
                    value={field.state.value}
                  />
                </FormControl>
                <FormDescription>This is your document title.</FormDescription>
                <FormMessage field={field} />
              </FormItem>
            )}
          </titleForm.Field>

          <ContentForm
            isSubmitting={isSubmitting}
            onSubmit={handleContentSubmit}
            onSubmitComplete={onSubmitComplete}
            submitButtonText="Create document"
            contentDescription="Write your document content here."
            uploadDescription="Upload additional files to include with this document."
          />
        </CardContent>
      </Card>
    </>
  );
};
