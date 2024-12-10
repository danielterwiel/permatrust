import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  diffSourcePlugin,
  DiffSourceToggleWrapper,
  headingsPlugin,
  ListsToggle,
  MDXEditor,
  toolbarPlugin,
  UndoRedo,
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
import { Input } from '@/components/ui/input';

import { toNumberSchema } from '@/schemas/primitives';

import type { FC } from 'react';

import '@mdxeditor/editor/style.css';

export const createDocumentFormSchema = z.object({
  content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  projects: z.array(z.number()),
  title: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
});

type CreateDocumentFormProps = {
  isSubmitting: boolean;
  onSubmit: (values: z.infer<typeof createDocumentFormSchema>) => void;
  projectId: string;
};

export const CreateDocumentForm: FC<CreateDocumentFormProps> = ({
  isSubmitting,
  onSubmit,
  projectId,
}) => {
  const projectIdNumber = toNumberSchema.parse(projectId);

  const form = useForm({
    defaultValues: {
      content: '# Hello world',
      projects: [projectIdNumber],
      title: '',
    },
    onSubmit: async ({ value }) => {
      onSubmit(value);
    },
  });

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
        <CardContent>
          <form
            className="space-y-8"
            onSubmit={(e) => {
              e.preventDefault();
              form.handleSubmit();
            }}
          >
            <form.Field
              name="title"
              validators={{
                onChange: ({ value }) => {
                  try {
                    createDocumentFormSchema.shape.title.parse(value);
                    return undefined;
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      return error.errors[0]?.message;
                    }
                    return 'Invalid input';
                  }
                },
              }}
            >
              {(field) => (
                <FormItem>
                  <FormLabel field={field}>Title</FormLabel>
                  <FormControl field={field}>
                    <Input
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="e.g. Leaflet"
                      value={field.state.value}
                    />
                  </FormControl>
                  <FormDescription>
                    This is your document title.
                  </FormDescription>
                  <FormMessage field={field} />
                </FormItem>
              )}
            </form.Field>

            <form.Field
              name="content"
              validators={{
                onChange: ({ value }) => {
                  try {
                    createDocumentFormSchema.shape.content.parse(value);
                    return undefined;
                  } catch (error) {
                    if (error instanceof z.ZodError) {
                      return error.errors[0]?.message;
                    }
                    return 'Invalid input';
                  }
                },
              }}
            >
              {(field) => (
                <FormItem>
                  <FormLabel field={field}>Content</FormLabel>
                  <FormControl field={field}>
                    <div className="border border-input">
                      <MDXEditor
                        className="rounded-md bg-background p-2 text-sm placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        contentEditableClassName="prose"
                        markdown={field.state.value}
                        onChange={(value) => field.handleChange(value)}
                        plugins={[
                          headingsPlugin(),
                          diffSourcePlugin(),
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
                        ]}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>This is your document.</FormDescription>
                  <FormMessage field={field} />
                </FormItem>
              )}
            </form.Field>

            <div className="flex justify-end">
              {isSubmitting ? (
                <Button disabled={true}>
                  <Loading className="place-items-start" text="Creating..." />
                </Button>
              ) : (
                <Button type="submit">Create document</Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </>
  );
};
