import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organisations',
)({
  beforeLoad: () => ({
    getTitle: () => 'Organisations',
  }),
  component: Organisations,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organisations() {
  return <Outlet />;
}
