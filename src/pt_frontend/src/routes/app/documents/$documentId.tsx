import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { Principal } from '@dfinity/principal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { z } from 'zod';
import { formatDateTime } from '@/utils/date';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import type { Row } from '@tanstack/react-table';
import type { Entity } from '@/consts/entities';
import type { Revision } from '@/declarations/pt_backend/pt_backend.did';

const revisionsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/documents/$documentId/',
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
    const revisions_response = await pt_backend.list_revisions_by_document_id(
      BigInt(documentId),
      pagination,
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

const RowActions = (row: Row<Revision>) => {
  const { projectId, documentId } = Route.useParams();
  return (
    <Link
      to="/projects/$projectId/documents/$documentId/revisions/$revisionId"
      params={{
        documentId,
        projectId,
        revisionId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function DocumentDetails() {
  const { projectId, documentId } = Route.useParams();
  const { revisions, paginationMetaData, active } = Route.useLoaderData();
  const [selected, setSelected] = useState<Entity[]>([]);

  function handleCheckedChange(revisions: Entity[]) {
    setSelected(revisions);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{active.document.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link
            to="/projects/$projectId/documents/$documentId/revisions/create"
            params={{ projectId, documentId }}
            variant="default"
          >
            <div className="flex gap-2">
              Create Revision
              <Icon name="file-stack-outline" size="md" />
            </div>
          </Link>
          <Link
            to="/projects/$projectId/documents/$documentId/revisions/diff"
            params={{
              projectId,
              documentId,
            }}
            search={{
              theirs: selected[0]?.id ? Number(selected[0].id) : undefined,
              current: selected[1]?.id ? Number(selected[1].id) : undefined,
            }}
            disabled={selected.length !== 2}
            variant={selected.length !== 2 ? 'secondary' : 'outline'}
          >
            Compare
          </Link>
        </div>
        <Table<Revision>
          tableData={revisions}
          onSelectionChange={handleCheckedChange}
          paginationMetaData={paginationMetaData}
          actions={RowActions}
          columnConfig={[
            {
              id: 'version',
              cellPreprocess: (v) => v,
            },
            {
              id: 'content',
              cellPreprocess: (content) => {
                return (
                  <div className="truncate max-w-md">
                    {new TextDecoder().decode(
                      new Uint8Array(content ? Object.values(content) : []),
                    )}
                  </div>
                );
              },
            },
            {
              id: 'created_by',
              headerName: 'Created by',
              cellPreprocess: (createdBy) =>
                Principal.fromUint8Array(createdBy).toString(),
            },
            {
              id: 'created_at',
              headerName: 'Created at',
              cellPreprocess: (createdAt) => formatDateTime(createdAt),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
