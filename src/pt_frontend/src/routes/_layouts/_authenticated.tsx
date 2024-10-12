import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { Header } from "@/components/Header";
import { Sidebar } from "@/components/Sidebar";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { handleResult } from "@/utils/handleResult";
import { stringifyBigIntObject } from "@/utils/stringifyBigIntObject";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { storage } from "@/utils/localStorage";
import type {
  OrganisationResult,
  UserResult,
} from "@/declarations/pt_backend/pt_backend.did";

export const Route = createFileRoute("/_authenticated")({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    await context.auth.initAuthClient();

    if (!context.auth.authenticated) {
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
    const userResponse = await pt_backend.get_user();

    let userResult: unknown;
    try {
      userResult = handleResult(userResponse);
    } catch (error) {
      if (location.href !== "/users/create") {
        throw redirect({
          to: "/users/create",
        });
      }
    }

    const organisationId = storage.getItem("activeOrganisationId");

    let organisationsResult: unknown;
    if (!organisationId) {
      const organisationsResponse =
        await pt_backend.list_organisations(DEFAULT_PAGINATION);
      try {
        organisationsResult = handleResult(organisationsResponse);
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

    const user = stringifyBigIntObject(userResult);
    const organisations = stringifyBigIntObject(organisationsResult);
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
    <div className="grid grid-rows-[auto_auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] grid-cols-[128px_1fr] sm:grid-cols-[128_auto] min-h-dvh">
      <Header auth={auth} />
      <Sidebar />
      <main className="col-span-2 sm:col-span-1 px-4">
        <Breadcrumbs />
        <Outlet />
      </main>
      <footer className="col-span-1 sm:col-span-2">
        (c) permatrust - 2024
      </footer>
    </div>
  );
}
