import { createFileRoute } from '@tanstack/react-router';

import { getWorkflowOptions, getWorkflowStateOptions } from '@/api/queries';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { workflowIdSchema } from '@/schemas/entities';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/$workflowId/',
)({
  loader: async ({ context, params }) => {
    const workflowId = workflowIdSchema.parse(params.workflowId);
    const workflow = await context.query.ensureQueryData(
      getWorkflowOptions({ id: workflowId }),
    );

    const workflowState = await context.query.ensureQueryData(
      getWorkflowStateOptions({ id: workflowId }),
    );

    context.getTitle = () => workflow.name;

    return {
      context,
      workflow,
      workflowState,
    };
  },
  component: WorkflowDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function WorkflowDetails() {
  // const { workflowId } = Route.useParams();
  // const { workflow, workflowState } = Route.useLoaderData();

  return (
    <div className="space-y-8">
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
    </div>
  );
}
