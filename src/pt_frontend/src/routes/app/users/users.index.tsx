import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_authenticated/users')({
  component: Users,
  beforeLoad: () => ({
    getTitle: () => 'Users',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Users() {
  return <Outlet />;
}
