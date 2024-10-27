import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { z } from 'zod';
import { formatDateTime } from '@/utils/formatDateTime';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import type { Row } from '@tanstack/react-table';
import type { Entity } from '@/types/entities';
import type {
  Revision,
  PaginationInput,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination';
import { ENTITY, ENTITY_NAME } from '@/consts/entities';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      value: '',
      entity: ENTITY.Revision,
      field: buildFilterField(
        ENTITY_NAME.Revision,
        FILTER_FIELD.Revision.Version,
      ),
      operator: FILTER_OPERATOR.Contains,
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(
      ENTITY_NAME.Revision,
      FILTER_FIELD.Revision.CreatedAt,
    ),
    order: SORT_ORDER.Desc,
  },
];

const revisionsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_REVISION_PAGINATION: PaginationInput = {
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_authenticated/projects/$projectId/documents/$documentId/',
)({
  component: DocumentDetails,
  validateSearch: (search) => revisionsSearchSchema.parse(search),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({
    params: { projectId, documentId },
    deps: { pagination },
    context,
  }) => {
    const revisionPagination = buildPaginationInput(
      DEFAULT_REVISION_PAGINATION,
      pagination,
    );
    const [revisions, paginationMetaData] =
      await context.api.call.list_revisions_by_document_id(
        BigInt(documentId),
        revisionPagination,
      );

    console.log('revisions', revisions);

    const document = await context.api.call.get_document(BigInt(documentId));

    return {
      context,
      revisions,
      paginationMetaData,
      pagination: revisionPagination,
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
  const { revisions, pagination, paginationMetaData, active } =
    Route.useLoaderData();
  const [selected, setSelected] = useState<Entity[]>([]);
  const navigate = useNavigate();

  function handleCheckedChange(revisions: Entity[]) {
    setSelected(revisions);
  }

  const RowActions = (row: Row<Revision>) => {
    return (
      <Link
        to="/projects/$projectId/documents/$documentId/revisions/$revisionId"
        variant="outline"
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

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            key={filterCriteria.entity.toString()}
            filterCriteria={filterCriteria}
            placeholder="Filter content..."
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                to: `/projects/${projectId}/documents/${documentId}`,
                search: {
                  pagination: {
                    ...pagination,
                    filters: [[filterCriteria]],
                  },
                },
              });
            }}
          />
        ))}
        <div className="flex gap-2">
          <Link
            to="/projects/$projectId/documents/$documentId/revisions/diff"
            params={{
              projectId,
              documentId,
            }}
            search={{
              theirs:
                selected[0]?.id !== undefined
                  ? Number(selected[0].id)
                  : undefined,
              current:
                selected[1]?.id !== undefined
                  ? Number(selected[1].id)
                  : undefined,
            }}
            disabled={selected.length !== 2}
            variant={selected.length !== 2 ? 'secondary' : 'outline'}
            className="h-7 gap-1"
          >
            <Icon name="git-compare-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Compare
            </span>
          </Link>
          <Link
            to="/projects/$projectId/documents/$documentId/revisions/create"
            params={{ projectId, documentId }}
            variant="default"
            className="h-7 gap-1"
            size="sm"
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
              name="file-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            {active.document.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Revision>
            tableData={revisions}
            onSelectionChange={handleCheckedChange}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.Revision}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: `/projects/${projectId}/documents/${documentId}`,
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
              });
            }}
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
                cellPreprocess: (createdBy) => createdBy.toString(),
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
    </>
  );
}
