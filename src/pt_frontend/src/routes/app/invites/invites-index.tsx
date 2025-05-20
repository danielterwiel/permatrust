import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/invites',
)({
  beforeLoad: () => ({
    getTitle: () => 'Invites',
  }),
  component: Invites,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Invites() {
  return <Outlet />;
}
