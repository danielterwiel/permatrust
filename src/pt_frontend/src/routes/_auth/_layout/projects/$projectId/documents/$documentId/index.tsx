import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { Link } from '@/components/Link';
import { DataTable, type TableDataItem } from '@/components/DataTable';
import { Icon } from '@/components/ui/Icon';
import { Principal } from '@dfinity/principal';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute(
  '/_auth/_layout/projects/$projectId/documents/$documentId/'
)({
  component: DocumentDetails,
  loader: async ({ params: { projectId, documentId }, context }) => {
    const revisions_response = await pt_backend.list_revisions(
      BigInt(projectId),
      BigInt(documentId)
    );
    const document_response = await pt_backend.get_document(BigInt(projectId));
    const revisions_result = handleResult(revisions_response);
    const document_result = handleResult(document_response);
    const revisions = stringifyBigIntObject(revisions_result);
    const document = stringifyBigIntObject(document_result);
    return {
      ...context,

      revisions,

      selected: {
        project: context.selected.project,
        document,
      },

      projectId,
    };
  },
});

function DocumentDetails() {
  const { projectId, documentId } = Route.useParams();
  const { revisions, selected } = Route.useLoaderData();
  const [checked, setChecked] = useState<TableDataItem[]>([]);

  function handleCheckedChange(revisions: TableDataItem[]) {
    setChecked(revisions);
  }

  return (
    <>
      <h2>{selected.document.title}</h2>
      <h3>Revisions</h3>
      <div className="flex gap-4 pr-6 flex-row-reverse">
        <Link
          to={'/projects/$projectId/documents/$documentId/revisions/create'}
          params={{ projectId, documentId }}
          variant="default"
        >
          <div className="flex gap-2">
            Create Revision
            <Icon name="file-stack-outline" size="md" />
          </div>
        </Link>
        <Link
          to={'/projects/$projectId/documents/$documentId/revisions/diff'}
          params={{
            projectId,
            documentId,
          }}
          search={{
            theirs: checked[0]?.id ? Number(checked[0].id) : undefined,
            current: checked[1]?.id ? Number(checked[1].id) : undefined,
          }}
          disabled={checked.length !== 2}
          variant="secondary"
        >
          Diff
        </Link>
      </div>
      <DataTable
        tableData={revisions}
        showOpenEntityButton={true}
        routePath="revisions"
        onSelectionChange={handleCheckedChange}
        columnConfig={[
          {
            id: 'version',
            cellPreprocess: (v) => v,
          },
          {
            id: 'author',
            cellPreprocess: (author) =>
              Principal.fromUint8Array(author).toString(),
          },
          {
            id: 'content',
            cellPreprocess: (content) => {
              return (
                <div className="truncate max-w-md">
                  {new TextDecoder().decode(
                    new Uint8Array(content ? Object.values(content) : [])
                  )}
                </div>
              );
            },
          },
          {
            id: 'timestamp',
            headerName: 'Created at',
            cellPreprocess: (timestamp) => {
              const date = new Date(Number(timestamp / 1000000));
              return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
            },
          },
        ]}
      />
    </>
  );
}
