import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Sidebar } from '@/components/Sidebar';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export const Route = createFileRoute('/_authenticated')({
  component: AuthLayout,
  beforeLoad: async ({ context, location }) => {
    // TODO: do not run every time
    console.log('initAuthClient should run once');
    await context.auth.initAuthClient();

    if (!context.auth.authenticated) {
      throw redirect({
        to: '/',
        search: {
          redirect: location.href,
        },
      });
    }
    return {
      getTitle: () => 'Home',
    };
  },
});

function AuthLayout() {
  return (
    <div className="min-h-screen grid grid-rows-[auto_auto_1fr_auto] sm:grid-rows-[auto_1fr_auto] grid-cols-[128px_1fr] sm:grid-cols-[128_auto]">
      <Header />
      <Sidebar />
      <main className="col-span-2 sm:col-span-1">
        <Breadcrumbs />
        <Outlet />
      </main>
      <footer className="col-span-1 sm:col-span-2">
        (c) permatrust - 2024
      </footer>
    </div>
  );
}
