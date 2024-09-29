import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { DataTable } from '@/components/DataTable';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute('/_auth/_layout/projects/$projectId/')({
  component: ProjectDetails,
  loader: async ({ params: { projectId }, context }) => {
    const documents_response = await pt_backend.list_documents(
      BigInt(projectId)
    );
    const project_response = await pt_backend.get_project(BigInt(projectId));
    const project_result = handleResult(project_response);
    const documents_result = handleResult(documents_response);
    const documents = stringifyBigIntObject(documents_result);
    const project = stringifyBigIntObject(project_result);
    return {
      ...context,

      documents,

      selected: {
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
  const { documents, selected } = Route.useLoaderData();

  return (
    <>
      <h2>{selected.project.name}</h2>
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
