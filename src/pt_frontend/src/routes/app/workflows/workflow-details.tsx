import { createFileRoute } from '@tanstack/react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/$workflowId/',
)({
  loader: async ({ context }) => {
    // const { workflowId } = Route.useParams();

    // const workflow_response = await api.get_workflow(BigInt(workflowId))
    // const workflow_result = handleResult(workflow_response)
    // const workflow = workflow_result

    return {
      ...context,

      // workflow,
    };
  },
  component: DocumentDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentDetails() {
  // const { workflowId } = Route.useParams();
  // const { workflow } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="file-orientation-outline"
            size="lg"
          />
          Workflow ID TODO
        </CardTitle>
      </CardHeader>
      <CardContent>Workflow content</CardContent>
    </Card>
  );
}
