import { MDXEditor, diffSourcePlugin, headingsPlugin } from '@mdxeditor/editor';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useEffect } from 'react';
import { z } from 'zod';

import { getDiffRevisionsOptions } from '@/api/queries';
import { decodeUint8Array } from '@/utils/decode-uint8-array';

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

  useEffect(() => {
    try {
      z.array(revisionSchema).parse(revisions);
    } catch (_error) {
      // TODO: handle error
    }
  }, [revisions]);

  const [original, updated] = revisions;

  const contentOriginal = decodeUint8Array(original.content);
  const contentUpdated = decodeUint8Array(updated.content);

  return (
    <MDXEditor
      markdown={contentOriginal}
      onError={(_error) => {
        // TODO: handle error
      }}
      plugins={[
        headingsPlugin(),
        diffSourcePlugin({
          diffMarkdown: contentUpdated,
          viewMode: 'diff',
        }),
      ]}
    />
  );
}
