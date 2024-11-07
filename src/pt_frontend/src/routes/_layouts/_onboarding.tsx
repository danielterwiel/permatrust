import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router';
import { initializeAuthAndRedirect } from '@/utils/initializeAuthAndRedirect';
import { initializeUserAndRedirect } from '@/utils/initializeUserAndRedirect';
import { initializeOrganisationAndRedirect } from '@/utils/initializeOrganisationAndRedirect';

export const Route = createFileRoute('/_authenticated/_onboarding')({
  component: OnboardingLayout,
  beforeLoad: async ({ context, location }) => {
    const defaultReturn = {
      context,
      getTitle: () => 'Home',
    };

    await initializeAuthAndRedirect(context, location);
    const user = await initializeUserAndRedirect(context, location);
    await initializeOrganisationAndRedirect(context, location, defaultReturn);

    const [organisations] =
      await context.api.call.list_organisations(DEFAULT_PAGINATION);

    if (
      !user &&
      !organisations.length &&
      location.pathname !== '/organisations/create'
    ) {
      throw redirect({ to: '/organisations/create' });
    }
    return defaultReturn;
  },
  loader: ({ context }) => {
    if (!context.auth.isAuthenticated) {
      throw redirect({ to: '/authenticate' });
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OnboardingLayout() {
  return (
    <div className="flex justify-center">
      <div className="p-8 max-w-[32rem] w-full">
        <Outlet />
      </div>
    </div>
  );
}
