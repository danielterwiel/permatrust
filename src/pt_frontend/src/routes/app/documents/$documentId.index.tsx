import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/$documentId',
)({
  component: DocumentId,
  beforeLoad: () => ({
    getTitle: () => 'Document',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentId() {
  return <Outlet />;
}
