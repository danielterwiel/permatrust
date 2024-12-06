import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects',
)({
  beforeLoad: () => ({
    getTitle: () => 'Projects',
  }),
  component: ProjectId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectId() {
  return <Outlet />;
}
