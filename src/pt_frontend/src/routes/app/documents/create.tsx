import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { handleResult } from '@/utils/handleResult';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/documents/create'
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
  const navigate = useNavigate();
  const params = Route.useParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      projects: [BigInt(params.projectId)],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);
    const response = await pt_backend.create_document(
      BigInt(params.projectId),
      values.title,
      content
    );
    const result = handleResult(response);
    navigate({
      to: `/projects/$projectId/documents/$documentId`,
      params: {
        projectId: params.projectId,
        documentId: result.toString(),
      },
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a new document</CardTitle>
        <CardDescription>A new beginning</CardDescription>
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
                    <Input placeholder="Document" {...field} />
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
                      className="mdx-editor-shadncn"
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
            <Button type="submit">Create</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
