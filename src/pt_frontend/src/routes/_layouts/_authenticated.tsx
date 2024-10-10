import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { handleResult } from '@/utils/handleResult';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    await context.auth.initAuthClient();

    console.log('context', context);

    if (!context.auth.authenticated) {
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
    const response = await pt_backend.get_user();
    let result;
    try {
      result = handleResult(response);
    } catch (error) {
      console.log('errror get_user', error);
      if (location.href !== '/users/create') {
        throw redirect({
          to: '/users/create',
        });
      }
    }

    const user = stringifyBigIntObject(result);
    const active = {
      ...context.active,
      user,
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
