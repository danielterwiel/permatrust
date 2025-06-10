import { MDXEditor, diffSourcePlugin, headingsPlugin } from '@mdxeditor/editor';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import { getDiffRevisionsOptions, listRevisionContentsOptions } from '@/api/queries';
import { downloadChunkedContent } from '@/utils/chunked-revision-download';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

const revisionSchema = z.object({
  content: z.union([z.array(z.number()), z.instanceof(Uint8Array)]),
  created_at: z.bigint(),
  created_by: z.string().uuid(),
  document_id: z.bigint(),
  id: z.bigint(),
  version: z.number(),
});

const revisionSearchSchema = z.object({
  current: z.number(),
  theirs: z.number(),
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/diff',
)({
  validateSearch: zodSearchValidator(revisionSearchSchema),
  loaderDeps: ({ search: { current, theirs } }) => ({ current, theirs }),
  loader: async ({ context, deps }) => {
    const revisions = await context.query.ensureQueryData(
      getDiffRevisionsOptions({
        original: BigInt(deps.current),
        updated: BigInt(deps.theirs),
      }),
    );
    return { revisions };
  },
  component: RevisionDiff,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function RevisionDiff() {
  const { revisions } = Route.useLoaderData();
  const { query } = Route.useRouteContext();
  const [contentOriginal, setContentOriginal] = useState('');
  const [contentUpdated, setContentUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      z.array(revisionSchema).parse(revisions);
    } catch (_error) {
      setError('Invalid revision data');
      setIsLoading(false);
      return;
    }
  }, [revisions]);

  // Helper function to extract markdown content from revision
  const getMarkdownContent = async (revision: any, queryClient: any): Promise<string> => {
    try {
      // First, fetch the actual revision contents
      const revisionContents = await queryClient.fetchQuery(
        listRevisionContentsOptions(BigInt(revision.id))
      );

      if (!revisionContents || revisionContents.length === 0) {
        return '';
      }

      // Find the first markdown content
      const markdownContent = revisionContents.find((content: any) =>
        'Markdown' in content.content_type
      );

      if (!markdownContent) return '';

      let bytes: Uint8Array;

      if ('Direct' in markdownContent.content_data) {
        bytes = new Uint8Array(markdownContent.content_data.Direct.bytes);
      } else {
        // Download chunked markdown content
        const { total_chunks, total_size } = markdownContent.content_data.Chunked;
        bytes = await downloadChunkedContent({
          contentId: markdownContent.id,
          totalChunks: total_chunks,
          totalSize: Number(total_size),
        });
      }

      return new TextDecoder().decode(bytes);
    } catch (err) {
      console.error('Failed to load markdown content:', err);
      return '';
    }
  };

  useEffect(() => {
    const loadContents = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [original, updated] = revisions;

        const [originalContent, updatedContent] = await Promise.all([
          getMarkdownContent(original, query),
          getMarkdownContent(updated, query),
        ]);

        setContentOriginal(originalContent);
        setContentUpdated(updatedContent);
      } catch (err) {
        console.error('Failed to load revision contents:', err);
        setError('Failed to load revision contents');
      } finally {
        setIsLoading(false);
      }
    };

    if (revisions && revisions.length >= 2) {
      loadContents();
    }
  }, [revisions, query]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="git-compare-outline"
              size="lg"
            />
            Loading revision comparison...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded animate-pulse"/>
            <div className="h-32 bg-muted rounded animate-pulse"/>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="git-compare-outline"
              size="lg"
            />
            Revision Comparison
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-red-500">
            Error: {error}
          </div>
        </CardContent>
      </Card>
    );
  }

  const [original, updated] = revisions;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="git-compare-outline"
            size="lg"
          />
          Comparing Revision #{original.version} vs #{updated.version}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MDXEditor
          markdown={contentOriginal}
          onError={(mdxError) => {
            console.error('MDX Editor error:', mdxError);
          }}
          plugins={[
            headingsPlugin(),
            diffSourcePlugin({
              diffMarkdown: contentUpdated,
              viewMode: 'diff',
            }),
          ]}
          readOnly={true}
        />
      </CardContent>
    </Card>
  );
}
