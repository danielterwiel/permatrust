import { createFileRoute, useParams, useNavigate } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { MDXEditor, UndoRedo, BoldItalicUnderlineToggles, headingsPlugin, toolbarPlugin } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'

export const Route = createFileRoute(
  "/_auth/_layout/projects/$projectId/documents/$documentId/revisions/create",
)({
  component: CreateRevision,
});

const formSchema = z.object({
  content: z.string().min(1, {
    message: "Content must be at least 1 character.",
  }),
  projects: z.array(z.bigint()),
}); // TODO: backend validation

export function CreateRevision() {
  const navigate = useNavigate();
  const params = useParams({
    from: "/_auth/_layout/projects/$projectId/documents/$documentId/revisions/create",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: "",
      projects: [BigInt(params.projectId)],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);

    const response = await pt_backend.create_document_revision(
      BigInt(params.projectId),
      BigInt(params.documentId),
      content,
    );
    console.log("response", response);
    navigate({ to: `/projects/${params.projectId}/documents/${params.documentId}/` });
    // TODO: error handling
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <MDXEditor
                  markdown="# Hello world"
                  contentEditableClassName="prose"
                  plugins={[
                    headingsPlugin(),
                    toolbarPlugin({
                      toolbarContents: () => (
                        <>
                          {' '}
                          <UndoRedo />
                          <BoldItalicUnderlineToggles />
                        </>
                      )
                    })
                  ]}
                  {...field} />
              </FormControl>
              <FormDescription>This is your document.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
