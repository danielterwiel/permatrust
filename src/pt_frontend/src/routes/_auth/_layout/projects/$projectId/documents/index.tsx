import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { DataTable, } from "@/components/DataTable";
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject'

export const Route = createFileRoute("/_auth/_layout/projects/$projectId/documents/")({
  component: ProjectDocuments,
  loader: async ({ params: { projectId } }) => {
    const response = await pt_backend.list_documents(BigInt(projectId));
    const documents = JSON.parse(stringifyBigIntObject(response));
    return { documents, projectId };
  },
});

function ProjectDocuments() {
  const { projectId } = Route.useParams();
  const { documents } = Route.useLoaderData()

  return (
    <>
      {/* TODO: get project.name for title */}
      <h2>Project documents {projectId}</h2>
      <h3>Documents</h3>
      <Link to={`/projects/${projectId}/documents/create`}>Create Document</Link>
      <DataTable tableData={documents} showOpenEntityButton={true} />
    </>
  );
}
