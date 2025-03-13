import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { waitFor } from 'xstate';

import { Auth } from '@/auth';

export const Route = createFileRoute('/_initialized/_authenticated')({
  beforeLoad: async ({ context }) => {
    const auth = Auth.getInstance();
    const authActor = context.actors.auth;
    await waitFor(authActor, (state) => state.matches('initialized'));
    if (!(await auth.isAuthenticated())) {
      throw redirect({ to: '/login' });
    }
  },
  component: AuthLayout,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  return <Outlet />;
}
