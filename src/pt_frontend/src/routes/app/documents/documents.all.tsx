import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

const documentsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute('/_authenticated/documents')({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_documents(pagination);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
        <CardDescription>View all your documents</CardDescription>
      </CardHeader>
      <CardContent>
        <Table
          tableData={documents}
          openLinkTo="/projects/$projectId/documents/$documentId"
          openLinkParamsNormalisation={{ projectId: 'project' }}
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
