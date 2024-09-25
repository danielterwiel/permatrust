import { createFileRoute } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { stringifyBigIntObject } from "@/helpers/stringifyBigIntObject";
import { Link } from '@tanstack/react-router'
import { DataTable, } from "@/components/DataTable";

export const Route = createFileRoute("/_auth/_layout/projects/$projectId/documents/$documentId/")({
  component: DocumentRevisions,
  loader: async ({ params: { projectId } }) => {
    const response = await pt_backend.list_document_revisions(BigInt(projectId));
    const revisions = JSON.parse(stringifyBigIntObject(response));

    return { revisions, projectId };
  },
});

function DocumentRevisions() {
  const { projectId, documentId } = Route.useParams();
  const { revisions } = Route.useLoaderData()

  return (
    <>
      {/* TODO: get document.name for title */}
      <h2>Document Revisions {documentId}</h2>
      <h3>Revisions</h3>
      <Link to={`/projects/${projectId}/documents/${documentId}/revisions/create`}>Create Revision</Link>
      <DataTable tableData={revisions} showOpenEntityButton={true} entityName="revisions" />
    </>
  )
}

