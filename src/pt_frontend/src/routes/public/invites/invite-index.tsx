import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_initialized/invites')({
  beforeLoad: () => ({
    getTitle: () => 'Accept invite',
  }),
  component: Invites,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Invites() {
  return <Outlet />;
}
