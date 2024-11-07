import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { initializeAuthAndRedirect } from '@/utils/initializeAuthAndRedirect';

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    const defaultReturn = {
      context,
      getTitle: () => 'Home',
    };

    await initializeAuthAndRedirect(context, location);

    return defaultReturn;
  },
  loader: ({ context }) => {
    if (!context.auth.isAuthenticated) {
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
