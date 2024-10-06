import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/organisations/$organisationId'
)({
  component: OrganisationId,
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationId() {
  return <Outlet />;
}
