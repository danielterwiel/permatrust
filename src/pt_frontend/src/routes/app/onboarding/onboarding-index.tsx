import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarding/onboarding/',
)({
  component: RouteComponent,
});

function RouteComponent() {
  return <Outlet />;
}
