import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/organisations')({
  component: OrganisationId,
  beforeLoad: () => ({
    getTitle: () => 'Organisations',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationId() {
  return <Outlet />;
}
