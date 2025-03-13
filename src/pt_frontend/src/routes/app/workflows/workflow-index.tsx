import { Outlet, createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/$workflowId',
)({
  component: WorkflowId,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function WorkflowId() {
  return <Outlet />;
}
