import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Sidebar } from '@/components/Sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { initializeAuthAndRedirect } from '@/utils/initializeAuthAndRedirect';
import { initializeUserAndRedirect } from '@/utils/initializeUserAndRedirect';
import { initializeOrganisationAndRedirect } from '@/utils/initializeOrganisationAndRedirect';

export const Route = createFileRoute('/_authenticated/_onboarded')({
  component: OnboardedLayout,
  beforeLoad: async ({ context, location }) => {
    const defaultReturn = {
      context,
      getTitle: () => 'Home',
    };

    await initializeAuthAndRedirect(context, location);
    await initializeUserAndRedirect(context, location);

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

function OnboardedLayout() {
  const { auth } = Route.useRouteContext({
    select: ({ auth }) => ({ auth }),
  });

  return (
    <SidebarProvider>
      <Sidebar auth={auth} />
      <div className="grid grid-cols-1 grid-rows-[auto_1fr] h-screen p-4 w-full">
        <main className="grid grid-cols-[auto_1fr] gap-4">
          <SidebarTrigger />
          <Breadcrumbs />
          <div className="col-span-2">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
