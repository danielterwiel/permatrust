import { z } from 'zod';
import { useState } from 'react';
import { api } from '@/api';
import { formatDateTime } from '@/utils/formatDateTime';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  SORT_ORDER,
} from '@/consts/pagination';
import { ENTITY_NAME } from '@/consts/entities';

const DEFAULT_FILTERS: [] = [];

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
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/',
)({
  component: DocumentDetails,
  validateSearch: zodSearchValidator(revisionsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_REVISION_PAGINATION,
  }),
  loader: async ({ params, deps, context }) => {
    const revisionPagination = buildPaginationInput(deps.pagination);

    const [revisions, paginationMetaData] =
      await api.list_revisions_by_document_id(
        BigInt(params.documentId),
        revisionPagination,
      );
    const document = await api.get_document(BigInt(params.documentId));

    return {
      context,
      revisions,
      paginationMetaData,
      pagination: revisionPagination,
      document,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function DocumentDetails() {
  const { projectId, documentId } = Route.useParams();
  const { revisions, pagination, paginationMetaData, document } =
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
        <div className="flex gap-2 ml-auto">
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
            {document.title}
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
                headerName: 'Version',
                cellPreprocess: (v) => v,
              },
              {
                id: 'content',
                headerName: 'Content',
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
