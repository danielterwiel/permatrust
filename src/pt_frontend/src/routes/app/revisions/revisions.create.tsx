import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Loading } from "@/components/Loading";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
} from "@mdxeditor/editor";
import "@mdxeditor/editor/style.css";

export const Route = createFileRoute(
  "/_authenticated/projects/$projectId/documents/$documentId/revisions/create",
)({
  component: CreateRevision,
  beforeLoad: () => ({
    getTitle: () => "Create revision",
  }),
});

const formSchema = z.object({
  content: z.string().min(1, {
    message: "Content must be at least 1 character.",
  }),
  projects: z.array(z.bigint()),
});

export function CreateRevision() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = Route.useParams();
  const { api } = Route.useRouteContext({
    select: ({ api }) => ({ api }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      content: "",
      projects: [BigInt(params.projectId)],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true);
      const encoder = new TextEncoder();
      const content = encoder.encode(values.content);

      await api.call.create_revision(
        BigInt(params.projectId),
        BigInt(params.documentId),
        content,
      );

      navigate({
        to: "/projects/$projectId/documents/$documentId",
        params,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
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
              </FormControl>
              <FormDescription>This is your document.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {isSubmitting ? (
          <Button disabled={true}>
            <Loading text="Saving..." />
          </Button>
        ) : (
          <Button disabled={isSubmitting} type="submit">
            Create revision
          </Button>
        )}
      </form>
    </Form>
  );
}
