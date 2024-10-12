import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Document } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute('/_authenticated/projects/$projectId/')({
  component: ProjectDetails,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Project',
  }),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ params: { projectId }, deps: { page }, context }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const documents_response = await pt_backend.list_documents_by_project_id(
      BigInt(projectId),
      pagination,
    );
    const project_response = await pt_backend.get_project(BigInt(projectId));
    const project_result = handleResult(project_response);
    const documents_result = handleResult(documents_response);
    const [documents, paginationMetaData] =
      stringifyBigIntObject(documents_result);
    const project = stringifyBigIntObject(project_result);

    return {
      ...context,

      documents,
      paginationMetaData,

      active: {
        project: project,
      },

      projectId,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { documents, paginationMetaData, active } = Route.useLoaderData();

  const RowActions = (row: Row<Document>) => {
    return (
      <Link
        to="/projects/$projectId/documents/$documentId"
        params={{
          projectId: row.original.project.toString(),
          documentId: row.id,
        }}
      >
        Open
      </Link>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{active.project.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId }}
            variant="default"
          >
            <div className="flex gap-2">
              Create Document
              <Icon name="file-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table<Document>
          tableData={documents}
          paginationMetaData={paginationMetaData}
          actions={RowActions}
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
