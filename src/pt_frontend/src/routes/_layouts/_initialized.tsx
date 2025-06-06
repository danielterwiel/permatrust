import { Outlet, createFileRoute } from '@tanstack/react-router';

import { authActor } from '@/machines/auth';

export const Route = createFileRoute('/_initialized')({
  beforeLoad: ({ context }) => {
    context.actors.auth = authActor;
    return {
      getTitle: () => 'Home',
    };
  },
  component: AuthLayout,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  return <Outlet />;
}
