import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/_layout/projects/$projectId/documents/$documentId/revisions/$revisionId/')({
  component: () => RevisionDetail
})

function RevisionDetail() {
  return <div>happy revision detail page</div>
}
