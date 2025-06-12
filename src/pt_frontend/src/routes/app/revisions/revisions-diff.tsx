import { MDXEditor, diffSourcePlugin, headingsPlugin } from '@mdxeditor/editor';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect, useState } from 'react';
import { z } from 'zod';

import {
  getDiffRevisionsOptions,
  listRevisionContentsOptions,
} from '@/api/queries';
import { downloadChunkedContent } from '@/utils/chunked-revision-download';
import { tryCatch } from '@/utils/try-catch';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import type {
  Revision,
  RevisionContent,
} from '@/declarations/tenant_canister/tenant_canister.did';
import type { QueryClient } from '@tanstack/react-query';

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

// Local type for discriminated union of content_data
// This should match the Candid-generated types, but is defined here for strictness
// Remove or update if the actual type is available from the Candid types

type DirectContent = { Direct: { bytes: Array<number> } };
type ChunkedContent = { Chunked: { total_chunks: number; total_size: number } };

function isDirectContent(data: unknown): data is DirectContent {
  if (typeof data !== 'object' || data === null || !('Direct' in data)) {
    return false;
  }
  const direct = (data as Record<string, unknown>).Direct;
  return (
    typeof direct === 'object' &&
    direct !== null &&
    Array.isArray((direct as Record<string, unknown>).bytes)
  );
}

function isChunkedContent(data: unknown): data is ChunkedContent {
  if (typeof data !== 'object' || data === null || !('Chunked' in data)) {
    return false;
  }
  const chunked = (data as Record<string, unknown>).Chunked;
  return (
    typeof chunked === 'object' &&
    chunked !== null &&
    typeof (chunked as Record<string, unknown>).total_chunks === 'number' &&
    typeof (chunked as Record<string, unknown>).total_size === 'number'
  );
}

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
    } catch {
      setError('Invalid revision data');
      setIsLoading(false);
      return;
    }
  }, [revisions]);

  // Helper function to extract markdown content from revision
  const getMarkdownContent = async (
    revision: Revision,
    queryClient: QueryClient,
  ): Promise<string> => {
    const { data: revisionContents, error: revisionContentsError } =
      await tryCatch(
        queryClient.fetchQuery(
          listRevisionContentsOptions(BigInt(revision.id)),
        ),
      );

    if (revisionContentsError || revisionContents.length === 0) {
      return '';
    }

    // Find the first markdown content
    const markdownContent = revisionContents.find(
      (content: RevisionContent) => 'Markdown' in content.content_type,
    );

    if (
      !markdownContent ||
      !Array.isArray(markdownContent.content_data) ||
      markdownContent.content_data.length === 0
    ) {
      return '';
    }

    const contentData = markdownContent.content_data[0] as unknown;
    let bytes: Uint8Array;

    if (isDirectContent(contentData)) {
      bytes = new Uint8Array(contentData.Direct.bytes);
    } else if (isChunkedContent(contentData)) {
      const { total_chunks, total_size } = contentData.Chunked;
      const { data: chunkedBytes, error: chunkError } = await tryCatch(
        downloadChunkedContent({
          contentId: markdownContent.id,
          totalChunks: total_chunks,
          totalSize: Number(total_size),
        }),
      );
      if (chunkError) {
        // TODO: throw error
        return '';
      }
      bytes = chunkedBytes;
    } else {
      return '';
    }

    return new TextDecoder().decode(bytes);
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: getMarkdownContent causes infinite loop
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

    if (revisions.length >= 2) {
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
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
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
          <div className="text-center py-4 text-red-500">Error: {error}</div>
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
