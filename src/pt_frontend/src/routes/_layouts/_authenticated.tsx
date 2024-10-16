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
    await context.auth.initializeAuth();

    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: "/",
        search: {
          redirect: location.href,
        },
      });
    }
    return {
      auth: context.auth,
      getTitle: () => "Home",
    };
  },
  loader: async ({ context, location }) => {
    const userResponse = await context.api.call.get_user();

    let user: unknown;
    try {
      user = handleResult(userResponse);
    } catch (error) {
      if (location.href !== "/users/create") {
        throw redirect({
          to: "/users/create",
        });
      }
    }

    const organisationId = storage.getItem("activeOrganisationId");

    let organisations: unknown;
    if (!organisationId) {
      const organisationsResponse =
        await context.api.call.list_organisations(DEFAULT_PAGINATION);
      try {
        organisations = handleResult(organisationsResponse);
        throw redirect({
          to: "/organisations",
        });
      } catch (error) {
        if (location.href !== "/organisations/create") {
          throw redirect({
            to: "/organisations/create",
          });
        }
      }
    }

    const active = {
      ...context.active,
      user,
      organisations,
    };
    return { user, active };
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
