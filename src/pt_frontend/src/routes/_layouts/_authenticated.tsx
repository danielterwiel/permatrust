import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
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
  const { auth } = Route.useRouteContext();
  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] grid-cols-[172px_1fr] sm:grid-cols-[172px_auto] min-h-dvh">
      <Header auth={auth} />
      <Sidebar />
      <main className="col-span-2 sm:col-span-1 px-4">
        <Breadcrumbs />
        <Outlet />
      </main>
      <footer className="col-span-1 sm:col-span-2 p-2">
        © permatrust - 2024
      </footer>
    </div>
  );
}
