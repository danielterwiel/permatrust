import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import '@mdxeditor/editor/style.css';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import type {
  PaginationInput,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import { buildFilterField } from '@/utils/buildFilterField';
import { SORT_ORDER, FILTER_FIELD } from '@/consts/pagination';
import { ENTITY_NAME } from '@/consts/entities';
import { decodeUint8Array } from '@/utils/decodeUint8Array';

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(
      ENTITY_NAME.Revision,
      FILTER_FIELD.Revision.CreatedAt,
    ),
    order: SORT_ORDER.Desc,
  },
];

const LAST_REVISION_PAGINATION: PaginationInput = {
  page_size: 1,
  page_number: 1,
  filters: [],
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/create',
)({
  component: CreateRevision,
  beforeLoad: async ({ context, params }) => {
    const [[revision]] = await context.api.call.list_revisions_by_document_id(
      BigInt(params.documentId),
      LAST_REVISION_PAGINATION,
    );

    return {
      getTitle: () => 'Create revision',
      revision,
    };
  },
});

const formSchema = z.object({
  content: z.string().min(1, {
    message: 'Content must be at least 1 character.',
  }),
  projects: z.array(z.bigint()),
});

export function CreateRevision() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const params = Route.useParams();
  const { api, revision } = Route.useRouteContext({
    select: ({ api, revision }) => ({ api, revision }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    disabled: isSubmitting,
    defaultValues: {
      content: '',
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
        to: '/projects/$projectId/documents/$documentId',
        params,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  }

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
            Revision details
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
                      <MDXEditor
                        markdown={markdown}
                        className="block w-full rounded-md border border-input bg-background p-2 text-sm placeholder:text-muted-foreground focus:border-2 focus:border-accent-foreground focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-accent-foreground disabled:cursor-not-allowed disabled:opacity-50"
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
}
