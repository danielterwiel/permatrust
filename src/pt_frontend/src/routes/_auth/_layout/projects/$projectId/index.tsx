import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { DataTable } from '@/components/DataTable';
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject';

export const Route = createFileRoute('/_auth/_layout/projects/$projectId/')({
  component: ProjectDetails,
  loader: async ({ params: { projectId } }) => {
    const response = await pt_backend.list_documents(BigInt(projectId));
    const documents = stringifyBigIntObject(response);
    return { documents, projectId };
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
      <div>TODO: project meta data</div>
      <Link to={`/projects/$projectId/documents/create`} params={{ projectId }}>
        Create Document
      </Link>
      <DataTable
        tableData={documents}
        showOpenEntityButton={true}
        routePath="documents"
      />
    </>
  );
}
