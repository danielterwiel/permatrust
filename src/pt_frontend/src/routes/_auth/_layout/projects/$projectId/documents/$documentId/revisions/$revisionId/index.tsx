import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute(
  '/_auth/_layout/projects/$projectId/documents/$documentId/revisions/$revisionId/'
)({
  component: DocumentRevisionDetail,
  loader: async ({ params: { revisionId } }) => {
    const response = await pt_backend.get_document_revision(BigInt(revisionId));
    const result = handleResult(response);
    const revision = stringifyBigIntObject(result);
    return { revision };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentRevisionDetail() {
  const { revision } = Route.useLoaderData();

  return (
    <MDXEditor
      plugins={[headingsPlugin()]}
      contentEditableClassName="prose"
      markdown={new TextDecoder().decode(
        new Uint8Array(
          revision?.content ? Object.values(revision?.content) : []
        )
      )}
      onError={(error) => console.error('MDXEditor error:', error)}
    />
  );
}
