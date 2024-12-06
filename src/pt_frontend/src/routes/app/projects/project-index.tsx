import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Project',
  }),
  component: ProjectId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectId() {
  return <Outlet />;
}
