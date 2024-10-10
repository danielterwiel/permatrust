import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { Principal } from '@dfinity/principal';
import { handleResult } from '@/utils/handleResult';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';
import { formatDateTime } from '@/utils/date';

const organisationsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute('/_authenticated/organisations/')({
  component: Organisations,
  validateSearch: (search) => organisationsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_organisations(pagination);
    const result = handleResult(response);
    const [organisations, paginationMetaData] = stringifyBigIntObject(result);
    return {
      ...context,

      organisations,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organisations() {
  const { organisations, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organisations</CardTitle>
        <CardDescription>
          View your organisations or create a new organisation
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link to="/organisations/create" variant="default">
            <div className="flex gap-2">
              Create Organisation
              <Icon name="rectangle-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table
          tableData={organisations}
          openLinkTo="/organisations/$organisationId"
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'name',
              headerName: 'Name',
              cellPreprocess: (v) => v,
            },
            {
              id: 'created_by',
              headerName: 'Created by',
              cellPreprocess: (createdBy) =>
                Principal.fromUint8Array(createdBy).toString(),
            },
            {
              id: 'created_at',
              headerName: 'Created at',
              cellPreprocess: (createdAt) => formatDateTime(createdAt),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
