import { Outlet, createFileRoute } from '@tanstack/react-router';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export const Route = createFileRoute('/_initialized/_authenticated/_onboarded')(
  {
    loader: ({ context }) => {
      const authActor = context.actors.auth;
      return {
        authActor,
      };
    },
    component: OnboardedLayout,
    errorComponent: ({ error }) => {
      return <div>Error: {error.message}</div>;
    },
  },
);

function OnboardedLayout() {
  const { authActor } = Route.useLoaderData();

  return (
    <>
      <SidebarProvider>
        <Sidebar authActor={authActor} />
        <div className="grid grid-cols-1 grid-rows-[auto_1fr] min-h-screen p-4 w-full">
          <header className="grid grid-cols-[auto_1fr] gap-4 pb-4">
            <SidebarTrigger />
            <Breadcrumbs />
          </header>
          <main className="flex flex-col grow min-h-0">
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
      <Toaster />
    </>
  );
}
