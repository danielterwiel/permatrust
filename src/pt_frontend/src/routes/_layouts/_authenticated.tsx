import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { handleResult } from '@/utils/handleResult';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { storage } from '@/utils/localStorage';
import type { User, UserResult, PaginatedOrganisationsResult } from '@/declarations/pt_backend/pt_backend.did.d'

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    await context.auth.initializeAuth();

    if (!context.auth.isAuthenticated) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
    return {
      auth: context.auth,
      getTitle: () => 'Home',
    };
  },

  loader: async ({ context, location }) => {
    const organisationId = storage.getItem('activeOrganisationId');
    const userResponse = await context.api.call.get_user();
    const user = handleResult(userResponse);
    if (organisationId) {
      return {
        context,
        active: {
          user
        }
      }
    }

    if (!user) {
      if (location.pathname !== '/users/create') {
        throw redirect({ to: '/users/create' });
      }
      return;
    }
    if (organisationId) {
      throw redirect({ to: `/organisations/${organisationId}` });
    }
    const organisationsResponse = await context.api.call.list_organisations(DEFAULT_PAGINATION);
    const result = handleResult(organisationsResponse);
    const [organisations] = result || [[]];
    if (organisations.length > 0) {
      if (location.pathname !== '/organisations') {
        throw redirect({ to: '/organisations' });
      }
    } else {
      if (location.pathname !== '/organisations/create') {
        throw redirect({ to: '/organisations/create' });
      }
    }
  }
})

function AuthLayout() {
  const { auth } = Route.useRouteContext();
  return (
    <div className="grid grid-rows-[auto_auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] grid-cols-[172px_1fr] sm:grid-cols-[172px_auto] min-h-dvh" >
      <Header auth={auth} />
      <Sidebar />
      <main className="col-span-2 sm:col-span-1 px-4">
        <Breadcrumbs />
        <Outlet />
      </main>
      <footer className="col-span-1 sm:col-span-2 p-2">
        © permatrust - 2024
      </footer>
    </div >
  );
}
