import { headingsPlugin, MDXEditor } from '@mdxeditor/editor';
import { createFileRoute } from '@tanstack/react-router';

import { getRevisionOptions } from '@/api/queries/revisions';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { toBigIntSchema } from '@/schemas/primitives';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/$revisionId',
)({
  beforeLoad: async () => ({
    getTitle: () => 'Revision',
  }),
  loader: async ({ context, params: { revisionId } }) => {
    const revision = await context.query.ensureQueryData(
      getRevisionOptions(toBigIntSchema.parse(revisionId)),
    );
    return {
      revision,
    };
  },
  component: RevisionDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function RevisionDetails() {
  const { revision } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="file-stack-outline"
            size="lg"
          />
          Revision #{revision?.version}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MDXEditor
          contentEditableClassName="prose"
          markdown={new TextDecoder().decode(
            new Uint8Array(
              revision?.content ? Object.values(revision?.content) : [],
            ),
          )}
          onError={(_error) => {
            // TODO: handle error
          }}
          plugins={[headingsPlugin()]}
          readOnly={true}
        />
      </CardContent>
    </Card>
  );
}
