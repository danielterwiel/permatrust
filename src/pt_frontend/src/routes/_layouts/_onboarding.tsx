import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding',
)({
  beforeLoad: async () => {
    return {
      getTitle: () => 'Home',
    };
  },
  component: OnboardingLayout,
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
