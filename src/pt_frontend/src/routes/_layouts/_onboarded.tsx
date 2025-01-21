import { createFileRoute, Outlet } from '@tanstack/react-router';

import { Breadcrumbs } from '@/components/breadcrumbs';
import { Sidebar } from '@/components/sidebar';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/toaster';

export const Route = createFileRoute('/_initialized/_authenticated/_onboarded')(
  {
    loader: async ({ context }) => {
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
      <Toaster />
    </>
  );
}
