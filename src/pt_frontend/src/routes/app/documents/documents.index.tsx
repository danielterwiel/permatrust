import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents',
)({
  component: Documents,
  beforeLoad: () => ({
    getTitle: () => 'Documents',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Documents() {
  return <Outlet />;
}
