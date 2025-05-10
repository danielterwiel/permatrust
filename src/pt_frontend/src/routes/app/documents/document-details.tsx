import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useState } from 'react';

import { listRevisionsByDocumentIdOptions } from '@/api/queries';
import { getDocumentOptions } from '@/api/queries/documents';
import { usePagination } from '@/hooks/use-pagination';
import { documentIdSchema } from '@/schemas/entities';
import { createPaginationSchema } from '@/schemas/pagination';
import { toNumberSchema } from '@/schemas/primitives';
import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Revision } from '@/declarations/tenant_canister/tenant_canister.did';
import type { RevisionId } from '@/types/entities';
import type { Row } from '@tanstack/react-table';

const { schema: revisionsSearchSchema, defaultPagination } =
  createPaginationSchema(ENTITY.REVISION, {
    defaultFilterField: FIELDS.REVISION.CREATED_AT,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.REVISION.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/',
)({
  validateSearch: zodSearchValidator(revisionsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps, params }) => {
    const documentId = documentIdSchema.parse(params.documentId);

    const pagination = processPaginationInput(deps.pagination);
    const [revisions, paginationMetaData] = await context.query.ensureQueryData(
      listRevisionsByDocumentIdOptions(documentId),
    );
    const document = await context.query.ensureQueryData(
      getDocumentOptions(documentId),
    );

    return {
      context,
      document,
      pagination,
      paginationMetaData,
      revisions,
    };
  },
  component: DocumentDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentDetails() {
  const { documentId, projectId } = Route.useParams();
  const { document, pagination, paginationMetaData, revisions } =
    Route.useLoaderData();
  const [selected, setSelected] = useState<Array<Revision>>([]);

  const effectiveSort = pagination.sort.length
    ? pagination.sort
    : defaultPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination,
  );

  function handleCheckedChange(revisionsList: Array<Revision>) {
    setSelected(revisionsList);
  }

  const RowActions = (row: Row<Revision>) => {
    const revisionId: RevisionId = row.original.id;

    return (
      <Link
        params={{
          documentId,
          projectId,
          revisionId: revisionId.toString(),
        }}
        to="/projects/$projectId/documents/$documentId/revisions/$revisionId"
        variant="outline"
      >
        Open
      </Link>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            filterCriteria={filterCriteria}
            key={filterCriteria.entity.toString()}
            onChange={onFilterChange}
            placeholder="Filter content..."
          />
        ))}
        <div className="flex gap-2 ml-auto">
          <Link
            className="h-7 gap-1"
            disabled={selected.length !== 2}
            params={{
              documentId,
              projectId,
            }}
            search={{
              current: selected[1]
                ? toNumberSchema.parse(selected[1].id)
                : undefined,
              theirs: selected[0]
                ? toNumberSchema.parse(selected[0].id)
                : undefined,
            }}
            to="/projects/$projectId/documents/$documentId/revisions/diff"
            variant={selected.length !== 2 ? 'secondary' : 'outline'}
          >
            <Icon name="git-compare-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Compare
            </span>
          </Link>
          <Link
            className="h-7 gap-1"
            params={{ documentId, projectId }}
            size="sm"
            to="/projects/$projectId/documents/$documentId/revisions/create"
            variant="default"
          >
            <Icon name="file-stack-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create revision
            </span>
          </Link>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-outline"
              size="lg"
            />
            {document.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Revision>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (revision) => revision.version,
                headerName: 'Version',
                key: 'version',
              },
              {
                cellPreprocess: (revision) => {
                  return (
                    <div className="truncate max-w-md">
                      {new TextDecoder().decode(
                        new Uint8Array(
                          // revision.content !== undefined ?
                          Object.values(revision.content),
                          // : [],
                        ),
                      )}
                    </div>
                  );
                },
                headerName: 'Content',
                key: 'content',
              },
              {
                cellPreprocess: (revision) => revision.created_by.toString(),
                headerName: 'Created by',
                key: 'created_by',
              },
              {
                cellPreprocess: (revision) =>
                  formatDateTime(revision.created_at),
                headerName: 'Created at',
                key: 'created_at',
              },
            ]}
            entityName={ENTITY.REVISION}
            getPageChangeParams={getPageChangeParams}
            onSelectionChange={handleCheckedChange}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={revisions}
          />
        </CardContent>
      </Card>
    </>
  );
}
