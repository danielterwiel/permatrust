import { createFileRoute, useParams, useRouter } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Document } from "@/declarations/pt_backend/pt_backend.did";
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

export const Route = createFileRoute(
  "/_auth/_layout/projects/$projectId/create",
)({
  component: CreateDocument,
});

const formSchema = z.object({
  title: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  content: z.string().min(1, {
    message: "Content must be at least 1 character.",
  }),
  projects: z.array(z.bigint()),
}); // TODO: backend validation

export function CreateDocument() {
  const router = useRouter();
  const params = useParams({
    from: "/_auth/_layout/projects/$projectId/create",
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      content: "",
      projects: [BigInt(params.projectId)],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // TODO: prevent create "create" as name
    const encoder = new TextEncoder();
    const content = encoder.encode(values.content);

    const response = await pt_backend.create_document(
      BigInt(params.projectId),
      values.title,
      content,
    );
    console.log("response", response);
    router.history.push(`/projects/${response}`);
    // TODO: error handling
  }

  return (
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
              <FormDescription>This is your project name.</FormDescription>
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
                <Input placeholder="Document" {...field} />
              </FormControl>
              <FormDescription>This is your project name.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
      </form>
    </Form>
  );
}
