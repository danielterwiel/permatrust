import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { DataTable } from '@/components/DataTable';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute('/_auth/_layout/projects/$projectId/')({
  component: ProjectDetails,
  loader: async ({ params: { projectId } }) => {
    const response = await pt_backend.list_documents(BigInt(projectId));
    const result = handleResult(response);
    const documents = stringifyBigIntObject(result);
    return { documents, projectId };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { documents } = Route.useLoaderData();

  return (
    <>
      {/* TODO: get project.name for title */}
      <h2>Project details {projectId}</h2>
      <h3>Documents</h3>
      <div className="flex gap-4 pr-6 flex-row-reverse">
        <Link
          to={'/projects/$projectId/documents/create'}
          params={{ projectId }}
          variant="default"
        >
          Create Document
        </Link>
      </div>
      <DataTable
        tableData={documents}
        showOpenEntityButton={true}
        routePath="documents"
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
    </>
  );
}
