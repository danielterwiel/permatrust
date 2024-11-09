import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/organisations',
)({
  component: Organisations,
  beforeLoad: () => ({
    getTitle: () => 'Organisations',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organisations() {
  return <Outlet />;
}
