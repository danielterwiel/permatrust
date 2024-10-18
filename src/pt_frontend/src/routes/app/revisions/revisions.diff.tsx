import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { MDXEditor, headingsPlugin, diffSourcePlugin } from "@mdxeditor/editor";
import { pt_backend } from "@/declarations/pt_backend";
import { handleResult } from "@/utils/handleResult";

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
  "/_authenticated/projects/$projectId/documents/$documentId/revisions/diff",
)({
  component: RevisionDiff,
  validateSearch: revisionSearchSchema,
  loaderDeps: ({ search: { current, theirs } }) => ({ current, theirs }),
  loader: async ({ context, deps: { current, theirs } }) => {
    const response = await context.api.call.diff_revisions(
      BigInt(current),
      BigInt(theirs),
    );
    const revisions = handleResult(response);
    return { revisions };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function preDecode(data: number[] | Uint8Array) {
  const uint8Array = Array.isArray(data) ? new Uint8Array(data) : data;
  return uint8Array;
}

function RevisionDiff() {
  const { revisions } = Route.useLoaderData();

  useEffect(() => {
    try {
      z.array(RevisionSchema).parse(revisions);
    } catch (error) {
      console.error("Revision validation error:", error);
    }
  }, [revisions]);

  const [current, theirs] = revisions;

  if (!current || !theirs) {
    return <div> TODO: hoax</div>;
  }

  const decoder = new TextDecoder();
  const contentCurrent = decoder.decode(preDecode(current.content));
  const contentTheirs = decoder.decode(preDecode(theirs.content));

  return (
    <MDXEditor
      markdown={contentCurrent}
      onError={(error) => console.error("MDXEditor error:", error)}
      plugins={[
        headingsPlugin(),
        diffSourcePlugin({
          diffMarkdown: contentTheirs,
          viewMode: "diff",
        }),
      ]}
    />
  );
}
