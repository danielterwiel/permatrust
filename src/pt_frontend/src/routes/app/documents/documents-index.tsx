import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents',
)({
  beforeLoad: () => ({
    getTitle: () => 'Documents',
  }),
  component: Documents,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Documents() {
  return <Outlet />;
}
