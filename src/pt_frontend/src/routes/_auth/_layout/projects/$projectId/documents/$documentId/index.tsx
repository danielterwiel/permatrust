import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject';
import { Link } from '@/components/Link';
import { DataTable, type TableDataItem } from '@/components/DataTable';

export const Route = createFileRoute(
  '/_auth/_layout/projects/$projectId/documents/$documentId/'
)({
  component: DocumentRevisionsList,
  loader: async ({ params: { projectId, documentId } }) => {
    const response = await pt_backend.list_document_revisions(
      BigInt(projectId),
      BigInt(documentId)
    );
    const revisions = stringifyBigIntObject(response);
    return { revisions, projectId };
  },
});

function DocumentRevisionsList() {
  const { projectId, documentId } = Route.useParams();
  const { revisions } = Route.useLoaderData();
  const [selected, setSelected] = useState<TableDataItem[]>([]);

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
        <Link
          to={'/projects/$projectId/documents/$documentId/revisions/create'}
          params={{ projectId, documentId }}
        >
          Create Revision
        </Link>
      </div>
      <div>
        <Link
          to={'/projects/$projectId/documents/$documentId/revisions/diff'}
          params={{
            projectId,
            documentId,
          }}
          search={{
            theirs: selected[0]?.id ? Number(selected[0].id) : undefined,
            current: selected[1]?.id ? Number(selected[1].id) : undefined,
          }}
          disabled={selected.length !== 2}
          variant="secondary"
        >
          Diff
        </Link>
      </div>
      <DataTable
        tableData={revisions}
        showOpenEntityButton={true}
        routePath="revisions"
        onSelectionChange={handleSelect}
      />
    </>
  );
}
