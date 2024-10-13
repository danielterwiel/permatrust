import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/components/Link';
import type { Row } from '@tanstack/react-table';
import type { Workflow } from '@/declarations/pt_backend/pt_backend.did';

const workflowsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute('/_authenticated/workflows/')({
  component: Workflows,
  validateSearch: (search) => workflowsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_workflows(pagination);
    const result = handleResult(response);
    const [workflows, paginationMetaData] = stringifyBigIntObject(result);
    return {
      ...context,

      workflows,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Workflow>) => {
  return (
    <Link
      to="/workflows/$workflowId"
      params={{
        workflowId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Workflows() {
  const { workflows, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="file-orientation-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Workflows
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link to="/workflows/create" variant="default">
            <div className="flex gap-2">
              <Icon name="briefcase-outline" size="md" />
              Create workflow
            </div>
          </Link>
        </div>
        <Table<Workflow>
          tableData={workflows}
          actions={RowActions}
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'name',
              headerName: 'Workflow name',
              cellPreprocess: (title) => title,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
