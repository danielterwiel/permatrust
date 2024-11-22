import { createFileRoute } from '@tanstack/react-router'
import { api } from '@/api'
import { MDXEditor, headingsPlugin } from '@mdxeditor/editor'
import { Icon } from '@/components/ui/Icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/revisions/$revisionId',
)({
  component: RevisionDetails,
  beforeLoad: async ({ params: { revisionId } }) => {
    const revision = await api.get_revision(BigInt(revisionId))
    return {
      revision,
      getTitle: () => 'Revision',
    }
  },
  loader: ({ context }) => ({
    revision: context.revision,
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function RevisionDetails() {
  const { revision } = Route.useLoaderData()

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="file-stack-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Revision #{revision?.version}
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
  )
}
