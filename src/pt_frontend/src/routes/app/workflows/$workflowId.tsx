import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createFileRoute } from '@tanstack/react-router';
// import { pt_backend } from '@/declarations/pt_backend';
// import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
// import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute('/_authenticated/workflows/$workflowId/')({
  component: DocumentDetails,
  loader: async ({ context }) => {
    // const { workflowId } = Route.useParams();

    // const workflow_response = await pt_backend.get_workflow(BigInt(workflowId))
    // const workflow_result = handleResult(workflow_response)
    // const workflow = stringifyBigIntObject(workflow_result)

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
        <CardTitle>Workflow ID TODO</CardTitle>
      </CardHeader>
      <CardContent>Workflow content</CardContent>
    </Card>
  );
}
