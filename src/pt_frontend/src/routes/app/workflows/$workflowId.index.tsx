import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/$workflowId',
)({
  beforeLoad: () => ({
    getTitle: () => 'Workflow',
  }),
  component: WorkflowId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function WorkflowId() {
  return <Outlet />;
}
