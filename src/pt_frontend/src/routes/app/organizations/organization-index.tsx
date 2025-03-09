import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/$organizationId',
)({
  component: OrganizationId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganizationId() {
  return <Outlet />;
}
