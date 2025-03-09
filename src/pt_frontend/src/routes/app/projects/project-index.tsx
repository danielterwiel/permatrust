import { createFileRoute, Outlet } from '@tanstack/react-router';

import { getProjectOptions } from '@/api/queries/projects';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId',
)({
  loader: async ({ context, params }) => {
    const projectId = Number(params.projectId);
    const project = await context.query.ensureQueryData(
      getProjectOptions(projectId),
    );
    context.getTitle = () => project.name;
  },
  component: ProjectId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectId() {
  return <Outlet />;
}
