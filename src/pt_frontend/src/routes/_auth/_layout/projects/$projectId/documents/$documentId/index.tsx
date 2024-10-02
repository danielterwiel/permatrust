import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { Principal } from '@dfinity/principal';
import { handleResult } from '@/utils/handleResult';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import type { Entity } from '@/consts/entities';
import { z } from 'zod';

const revisionsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_auth/_layout/projects/$projectId/documents/$documentId/'
)({
  component: DocumentDetails,
  validateSearch: (search) => revisionsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({
    params: { projectId, documentId },
    deps: { page },
    context,
  }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const revisions_response = await pt_backend.list_revisions(
      BigInt(projectId),
      BigInt(documentId),
      pagination
    );
    const document_response = await pt_backend.get_document(BigInt(documentId));
    const revisions_result = handleResult(revisions_response);
    const document_result = handleResult(document_response);
    const [revisions, paginationMetaData] =
      stringifyBigIntObject(revisions_result);
    const document = stringifyBigIntObject(document_result);

    return {
      ...context,

      revisions,
      paginationMetaData,

      active: {
        project: context.active.project,
        document,
      },

      projectId,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentDetails() {
  const { projectId, documentId } = Route.useParams();
  const { revisions, paginationMetaData, active } = Route.useLoaderData();
  const [selected, setSelected] = useState<Entity[]>([]);

  function handleCheckedChange(revisions: Entity[]) {
    setSelected(revisions);
  }

  return (
    <>
      <h2>{active.document.title}</h2>
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
            theirs: selected[0]?.id ? Number(selected[0].id) : undefined,
            current: selected[1]?.id ? Number(selected[1].id) : undefined,
          }}
          disabled={selected.length !== 2}
          variant="secondary"
        >
          Diff
        </Link>
      </div>
      <Table
        tableData={revisions}
        showOpenEntityButton={true}
        routePath="revisions"
        onSelectionChange={handleCheckedChange}
        paginationMetaData={paginationMetaData}
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
