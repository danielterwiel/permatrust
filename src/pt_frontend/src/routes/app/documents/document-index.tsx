import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Document',
  }),
  component: DocumentId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentId() {
  return <Outlet />;
}
