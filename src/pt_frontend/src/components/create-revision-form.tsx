
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  DiffSourceToggleWrapper,
  ListsToggle,
  MDXEditor,
  UndoRedo,
  diffSourcePlugin,
  headingsPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
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
import { projectIdSchema } from '@/schemas/entities';
import { createZodFieldValidator } from '@/utils/create-zod-field-validator';
import { decodeUint8Array } from '@/utils/decode-uint8-array';

import type { Revision } from '@/declarations/pt_backend/pt_backend.did';
import type { FC } from 'react';

export const createRevisionFormSchema = z.object({
  content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  project_id: projectIdSchema,
});

type CreateRevisionFormProps = {
  isSubmitting: boolean;
  onSubmit: (data: z.infer<typeof createRevisionFormSchema>) => void;
  projectId: string;
  revision: Revision | undefined;
};

export const CreateRevisionForm: FC<CreateRevisionFormProps> = ({
  isSubmitting,
  onSubmit,
  projectId,
  revision,
}) => {
  const content = decodeUint8Array(revision?.content);

  const form = useForm({
    defaultValues: {
      content,
      project_id: projectIdSchema.parse(projectId),
    },
    onSubmit: ({ value }) => {
      onSubmit(value);
    },
  });

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Create new revision</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-stack-outline"
              size="lg"
            />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="content"
              validators={{
                onSubmit: createZodFieldValidator(
                  createRevisionFormSchema,
                  'content',
                ),
              }}
            >
              {(field) => (
                <FormItem>
                  <FormLabel field={field}>Content</FormLabel>
                  <FormControl field={field}>
                    <div className="rounded-lg border border-input">
                      <MDXEditor
                        className="rounded-md bg-background p-2 text-sm placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        contentEditableClassName="prose"
                        markdown={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                        plugins={[
                          headingsPlugin(),
                          toolbarPlugin({
                            toolbarContents: () => (
                              <DiffSourceToggleWrapper>
                                <UndoRedo />
                                <BoldItalicUnderlineToggles />
                                <BlockTypeSelect />
                                <ListsToggle />
                              </DiffSourceToggleWrapper>
                            ),
                          }),
                          diffSourcePlugin(),
                        ]}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>
                    This is the new revision of your document.
                  </FormDescription>
                  <FormMessage field={field} />
                </FormItem>
              )}
            </form.Field>

            <div className="flex justify-end">
              {isSubmitting ? (
                <Button disabled={true}>
                  <Loading text="Saving..." />
                </Button>
              ) : (
                <Button type="submit">Create revision</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
