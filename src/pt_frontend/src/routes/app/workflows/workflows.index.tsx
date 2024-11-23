import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows',
)({
  beforeLoad: () => ({
    getTitle: () => 'Workflows',
  }),
  component: Workflows,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Workflows() {
  return <Outlet />;
}
