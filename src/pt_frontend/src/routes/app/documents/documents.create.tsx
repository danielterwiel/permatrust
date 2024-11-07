import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/Icon';
import { Input } from '@/components/ui/input';
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
  BlockTypeSelect,
  DiffSourceToggleWrapper,
  ListsToggle,
  diffSourcePlugin,
  headingsPlugin,
  toolbarPlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create document',
  }),
  component: CreateDocument,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const formSchema = z.object({
  title: z.string().min(2, {
    message: 'Project name must be at least 2 characters.',
  }),
  content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  projects: z.array(z.bigint()),
});

export function CreateDocument() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = Route.useParams();
  const context = Route.useRouteContext({
    select: ({ api }) => ({ api }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      title: '',
      content: '',
      projects: [BigInt(params.projectId)],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);
    const documentId = await context.api.call.create_document(
      BigInt(params.projectId),
      values.title,
      content,
    );
    setIsSubmitting(false);
    navigate({
      to: '/projects/$projectId/documents/$documentId',
      params: {
        projectId: params.projectId,
        documentId: documentId.toString(),
      },
    });
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        <h2 className="text-lg font-semibold">Create new document</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="file-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Document details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      <MDXEditor
                        className="block w-full rounded-md border border-input bg-background p-2 text-sm placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
                        markdown="# Hello world"
                        contentEditableClassName="prose"
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
                    </FormControl>
                    <FormDescription>This is your document.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end">
                {isSubmitting ? (
                  <Button disabled={true}>
                    <Loading text="Creating..." className="place-items-start" />
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
}
