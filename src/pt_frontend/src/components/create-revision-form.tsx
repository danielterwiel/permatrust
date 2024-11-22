import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
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
import {
  MDXEditor,
  UndoRedo,
  BoldItalicUnderlineToggles,
  DiffSourceToggleWrapper,
  BlockTypeSelect,
  ListsToggle,
  headingsPlugin,
  diffSourcePlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { decodeUint8Array } from '@/utils/decodeUint8Array';
import type { Revision } from '@/declarations/pt_backend/pt_backend.did';
import type { FC } from 'react';

export const createRevisionFormSchema = z.object({
  content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  projects: z.array(z.bigint()),
});

type CreateRevisionFormProps = {
  projectId: string;
  revision: Revision | undefined;
  isSubmitting: boolean;
  onSubmit: (data: z.infer<typeof createRevisionFormSchema>) => void;
};

export const CreateRevisionForm: FC<CreateRevisionFormProps> = ({
  projectId,
  revision,
  isSubmitting,
  onSubmit,
}) => {
  const form = useForm<z.infer<typeof createRevisionFormSchema>>({
    resolver: zodResolver(createRevisionFormSchema),
    disabled: isSubmitting,
    defaultValues: {
      content: '',
      projects: [BigInt(projectId)],
    },
  });

  const content = decodeUint8Array(revision?.content);
  const markdown = content ?? '';

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Create new revision</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="file-stack-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                          markdown={markdown}
                          contentEditableClassName="prose"
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
                    <Loading text="Saving..." />
                  </Button>
                ) : (
                  <Button disabled={isSubmitting} type="submit">
                    Create revision
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </>
  );
};
