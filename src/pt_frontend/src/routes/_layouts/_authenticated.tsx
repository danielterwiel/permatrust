import { waitFor } from 'xstate';
import { createFileRoute, redirect, Outlet } from '@tanstack/react-router';
import { Auth } from '@/auth';

export const Route = createFileRoute('/_initialized/_authenticated')({
  component: AuthLayout,
  beforeLoad: async ({ context }) => {
    const auth = Auth.getInstance();
    const authActor = context.actors.auth;
    await waitFor(authActor, (state) => state.matches('initialized'));
    if (!(await auth.isAuthenticated())) {
      throw redirect({ to: '/authenticate' });
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  return <Outlet />;
}
