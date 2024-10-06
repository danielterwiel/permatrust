import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor';
import { handleResult } from '@/utils/handleResult';
import { formatDateTime } from '@/utils/date';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/documents/$documentId/revisions/$revisionId'
)({
  component: RevisionDetails,
  beforeLoad: () => ({
    getTitle: () => 'Revision',
  }),
  loader: async ({ params: { revisionId }, context }) => {
    const response = await pt_backend.get_revision(BigInt(revisionId));
    const result = handleResult(response);
    const revision = stringifyBigIntObject(result);
    const active = {
      ...context.active,
      revision,
    };
    return { revision, active };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function RevisionDetails() {
  const { revision, active } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Revision #{active.revision?.version}</CardTitle>
        <CardDescription>
          {formatDateTime(active.revision?.timestamp)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <MDXEditor
          readOnly={true}
          plugins={[headingsPlugin()]}
          contentEditableClassName="prose"
          markdown={new TextDecoder().decode(
            new Uint8Array(
              revision?.content ? Object.values(revision?.content) : []
            )
          )}
          onError={(error) => console.error('MDXEditor error:', error)}
        />
      </CardContent>
    </Card>
  );
}
