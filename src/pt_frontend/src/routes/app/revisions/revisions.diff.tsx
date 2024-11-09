import { useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { z } from 'zod';
import { MDXEditor, headingsPlugin, diffSourcePlugin } from '@mdxeditor/editor';
import { decodeUint8Array } from '@/utils/decodeUint8Array';

const RevisionSchema = z.object({
  id: z.bigint(),
  content: z.union([z.array(z.number()), z.instanceof(Uint8Array)]),
  version: z.number(),
  created_at: z.bigint(),
  created_by: z.any(), // TODO: validate Principals
  document_id: z.bigint(),
});

const revisionSearchSchema = z.object({
  current: z.number(),
  theirs: z.number(),
});

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/diff',
)({
  component: RevisionDiff,
  validateSearch: revisionSearchSchema,
  loaderDeps: ({ search: { current, theirs } }) => ({ current, theirs }),
  loader: async ({ context, deps: { current, theirs } }) => {
    const revisions = await context.api.call.diff_revisions(
      BigInt(current),
      BigInt(theirs),
    );
    return { revisions };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function RevisionDiff() {
  const { revisions } = Route.useLoaderData();

  useEffect(() => {
    try {
      z.array(RevisionSchema).parse(revisions);
    } catch (error) {
      console.error('Revision validation error:', error);
    }
  }, [revisions]);

  const [current, theirs] = revisions;

  if (!current || !theirs) {
    return <div> TODO: hoax</div>;
  }

  const contentCurrent = decodeUint8Array(current.content);
  const contentTheirs = decodeUint8Array(theirs.content);

  return (
    <MDXEditor
      markdown={contentCurrent}
      onError={(error) => console.error('MDXEditor error:', error)}
      plugins={[
        headingsPlugin(),
        diffSourcePlugin({
          diffMarkdown: contentTheirs,
          viewMode: 'diff',
        }),
      ]}
    />
  );
}
