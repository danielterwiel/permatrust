import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { MDXEditor, diffSourcePlugin } from "@mdxeditor/editor";
import { pt_backend } from "@/declarations/pt_backend";

const DocumentRevisionSchema = z.object({
  id: z.bigint(),
  content: z.union([z.array(z.number()), z.instanceof(Uint8Array)]),
  author: z.any(), // TODO: validate Principals
  version: z.number(),
  timestamp: z.bigint(),
  document_id: z.bigint(),
});

const revisionSearchSchema = z.object({
  current: z.number(),
  theirs: z.number(),
});

export const Route = createFileRoute(
  "/_auth/_layout/projects/$projectId/documents/$documentId/revisions/diff",
)({
  component: DocumentRevisionDiff,
  validateSearch: revisionSearchSchema,
  loaderDeps: ({ search: { current, theirs } }) => ({ current, theirs }),
  loader: async ({ deps: { current, theirs } }) => {
    const revisions = await pt_backend.diff_document_revisions(
      BigInt(current),
      BigInt(theirs),
    );
    return { revisions };
  },
});

function preDecode(data: number[] | Uint8Array) {
  const uint8Array = Array.isArray(data) ? new Uint8Array(data) : data;
  return uint8Array;
}

function DocumentRevisionDiff() {
  // const { current, theirs } = Route.useSearch();
  const { revisions } = Route.useLoaderData();

  useEffect(() => {
    try {
      const validatedRevisions = z
        .array(DocumentRevisionSchema)
        .parse(revisions);
      console.log("Validated revisions", validatedRevisions);
    } catch (error) {
      console.error("Revision validation error:", error);
    }
  }, [revisions]);

  // console.log('current', current);
  // console.log('theirs', theirs);
  console.log("revisions", revisions);

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
        diffSourcePlugin({
          diffMarkdown: contentTheirs,
          viewMode: "diff",
          readOnlyDiff: true,
        }),
      ]}
    />
  );
}
