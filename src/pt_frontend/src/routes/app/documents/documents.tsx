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

const documentsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/documents/'
)({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, params, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_documents_by_project_id(
      BigInt(params.projectId),
      pagination
    );
    const result = handleResult(response);
    const [documents, paginationMetaData] = stringifyBigIntObject(result);
    return {
      ...context,

      documents,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Documents() {
  const { documents, paginationMetaData } = Route.useLoaderData();
  const { projectId } = Route.useParams();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>
          View your documents or create a new document
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId }}
            variant="default"
          >
            <div className="flex gap-2">
              Create document
              <Icon name="file-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table
          tableData={documents}
          openLinkTo="/projects/$projectId/documents/$documentId"
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'title',
              headerName: 'Document Title',
              cellPreprocess: (title) => title,
            },
            {
              id: 'current_version',
              headerName: 'Version',
              cellPreprocess: (version) => version,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
