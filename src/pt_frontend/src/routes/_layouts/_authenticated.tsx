import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { storage } from "@/utils/localStorage";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    const activeOrganisationId = storage.getItem("activeOrganisationId", "");
    const defaultReturn = {
      context,
      getTitle: () => "Home",
    };

    await context.auth.initializeAuth();
    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
    if (activeOrganisationId) {
      return defaultReturn;
    }
    const redirectWhenUserNotFound = () => {
      if (location.pathname !== "/users/create") {
        throw redirect({ to: "/users/create" });
      }
    };
    const user = await context.api.call.get_user({
      onErr: redirectWhenUserNotFound,
    });

    const [organisations] =
      await context.api.call.list_organisations(DEFAULT_PAGINATION);

    if (
      !user &&
      !organisations.length &&
      location.pathname !== "/organisations/create"
    ) {
      throw redirect({ to: "/organisations/create" });
    }
    return defaultReturn;
  },
  loader: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: "/authenticate" });
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  const { auth } = Route.useRouteContext({
    select: ({ auth }) => ({ auth }),
  });

  return (
    <SidebarProvider>
      <Sidebar auth={auth} />
      <main className="grid grid-cols-1 grid-rows-[auto_1fr] h-screen p-4 w-full">
        <div className="grid grid-cols-[auto_1fr] gap-4">
          <SidebarTrigger />
          <Breadcrumbs />
          <div className="col-span-2">
            <Outlet />
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}
