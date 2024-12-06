import { zodResolver } from '@hookform/resolvers/zod';
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
  const form = useForm<z.infer<typeof createDocumentFormSchema>>({
    defaultValues: {
      content: '',
      projects: [projectIdNumber],
      title: '',
    },
    disabled: isSubmitting,
    resolver: zodResolver(createDocumentFormSchema),
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
          <Form {...form}>
            <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Leaflet" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is your document title.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <div className="border border-input">
                        <MDXEditor
                          className="rounded-md bg-background p-2 text-sm placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                          contentEditableClassName="prose"
                          markdown="# Hello world"
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
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>This is your document.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
