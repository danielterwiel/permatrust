import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { RouterSpinner } from "@/components/RouterSpinner";
import { Sidebar } from "@/components/Sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { handleResult } from "@/utils/handleResult";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { storage } from "@/utils/localStorage";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
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
    const organisationId = storage.getItem("activeOrganisationId");
    if (organisationId) {
      return defaultReturn;
    }
    const userResponse = await context.api.call.get_user();
    const redirectWhenUserNotFound = () => {
      if (location.pathname !== "/users/create") {
        throw redirect({ to: "/users/create" });
      }
    };
    const user = handleResult(userResponse, {
      onErr: redirectWhenUserNotFound,
    });

    const organisationsResponse =
      await context.api.call.list_organisations(DEFAULT_PAGINATION);

    const [organisations] = handleResult(organisationsResponse);
    if (!user && !organisations.length && location.pathname !== "/organisations/create") {
      throw redirect({ to: "/organisations/create" });
    }
    return defaultReturn
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function AuthLayout() {
  return (
    <SidebarProvider>
      <RouterSpinner />
      <Sidebar />
      <main className="grid grid-cols-1 grid-rows-[auto_1fr] h-screen pr-8 pt-4 w-full">
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
