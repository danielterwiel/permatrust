import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authenticated/organisations/$organisationId/projects/$projectId/documents/$documentId/revisions",
)({
  component: Documents,
  beforeLoad: () => ({
    getTitle: () => "Revisions",
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Documents() {
  return <Outlet />;
}
