import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/organisations/$organisationId/projects",
)({
  component: ProjectId,
  beforeLoad: () => ({
    getTitle: () => "Projects",
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectId() {
  return <Outlet />;
}
