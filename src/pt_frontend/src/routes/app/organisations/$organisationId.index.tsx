import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organisations/$organisationId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  component: OrganisationId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationId() {
  return <Outlet />;
}
