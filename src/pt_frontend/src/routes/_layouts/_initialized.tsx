import { authActor } from '@/machines/auth-machine';
import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute('/_initialized')({
  component: AuthLayout,
  beforeLoad: async ({ context }) => {
    context.actors.auth = authActor;
    return {
      getTitle: () => 'Home',
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  return <Outlet />;
}
