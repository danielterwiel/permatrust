import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles',
)({
  beforeLoad: () => ({
    getTitle: () => 'Roles',
  }),
  component: Roles,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Roles() {
  return <Outlet />;
}
