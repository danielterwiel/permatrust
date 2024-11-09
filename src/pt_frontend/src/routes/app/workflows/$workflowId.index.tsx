import { createFileRoute, Outlet } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/workflows/$workflowId',
)({
  component: WorkflowId,
  beforeLoad: () => ({
    getTitle: () => 'Workflow',
  }),
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function WorkflowId() {
  return <Outlet />;
}
