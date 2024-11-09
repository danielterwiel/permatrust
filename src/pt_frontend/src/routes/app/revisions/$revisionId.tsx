import { createFileRoute } from '@tanstack/react-router';
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor';
import { Icon } from '@/components/ui/Icon';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/$revisionId',
)({
  component: RevisionDetails,
  beforeLoad: () => ({
    getTitle: () => 'Revision',
  }),
  loader: async ({ params: { revisionId }, context }) => {
    const revision = await context.api.call.get_revision(BigInt(revisionId));
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
        <CardTitle>
          <Icon
            name="file-stack-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Revision #{active.revision?.version}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <MDXEditor
          readOnly={true}
          plugins={[headingsPlugin()]}
          contentEditableClassName="prose"
          markdown={new TextDecoder().decode(
            new Uint8Array(
              revision?.content ? Object.values(revision?.content) : [],
            ),
          )}
          onError={(error) => console.error('MDXEditor error:', error)}
        />
      </CardContent>
    </Card>
  );
}
