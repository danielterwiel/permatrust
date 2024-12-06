import { Outlet, createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_initialized/_authenticated/_onboarded/organizations",
)({
  beforeLoad: () => ({
    getTitle: () => "Organizations",
  }),
  component: Organizations,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organizations() {
  return <Outlet />;
}
