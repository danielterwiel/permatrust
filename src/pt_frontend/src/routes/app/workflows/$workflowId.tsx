import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/workflows/$workflowId/")({
  component: DocumentDetails,
  loader: async ({ context }) => {
    // const { workflowId } = Route.useParams();

    // const workflow_response = await context.api.call.get_workflow(BigInt(workflowId))
    // const workflow_result = handleResult(workflow_response)
    // const workflow = workflow_result

    return {
      ...context,

      // workflow,
    };
  },
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
            name="file-orientation-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Workflow ID TODO
        </CardTitle>
      </CardHeader>
      <CardContent>Workflow content</CardContent>
    </Card>
  );
}
