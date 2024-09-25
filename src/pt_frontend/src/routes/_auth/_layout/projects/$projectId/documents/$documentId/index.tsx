import { useState } from 'react';
import { createFileRoute } from "@tanstack/react-router";
import { pt_backend, } from "@/declarations/pt_backend";
import { stringifyBigIntObject } from "@/helpers/stringifyBigIntObject";
import { Link } from '@tanstack/react-router';
import { DataTable, type TableDataItem } from "@/components/DataTable";
import type { DocumentRevision, } from "@/declarations/pt_backend/pt_backend.did";

export const Route = createFileRoute("/_auth/_layout/projects/$projectId/documents/$documentId/")({
  component: DocumentRevisionsList,
  loader: async ({ params: { projectId } }) => {
    const response = await pt_backend.list_document_revisions(BigInt(projectId));
    const revisions = JSON.parse(stringifyBigIntObject(response));
    return { revisions, projectId };
  },
});

function DocumentRevisionsList() {
  const { projectId, documentId } = Route.useParams();
  const { revisions } = Route.useLoaderData();
  const [selected, setSelected] = useState<TableDataItem[]>([])

  function handleSelect(revisions: TableDataItem[]) {
    // todo: maybe sort by version
    setSelected(revisions);
  }

  return (
    <>
      {/* TODO: get document.name for title */}
      <h2>Document Revisions {documentId}</h2>
      <h3>Revisions</h3>
      <div>
        <Link to={`/projects/${projectId}/documents/${documentId}/revisions/create`}>Create Revision</Link>

      </div>
      <div>
        <Link
          to={`/projects/${projectId}/documents/${documentId}/revisions/diff?theirs=${selected[0]?.id}&current=${selected[1]?.id}`}
          disabled={selected.length !== 2}
        >
          Diff
        </Link>
      </div>
      <DataTable
        tableData={revisions}
        showOpenEntityButton={true}
        entityName="revisions"
        onSelectionChange={handleSelect}
      />
    </>
  );
}
