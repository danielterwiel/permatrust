import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useState } from 'react';
import { z } from 'zod';

import { api } from '@/api';

import { FilterInput } from '@/components/FilterInput';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';

import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { formatDateTime } from '@/utils/formatDateTime';

import { ENTITY_NAME } from '@/consts/entities';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  SORT_ORDER,
} from '@/consts/pagination';

import { paginationInputSchema } from '@/schemas/pagination';

import type {
  PaginationInput,
  Revision,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Entity } from '@/types/entities';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

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
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/$documentId/',
)({
  validateSearch: zodSearchValidator(revisionsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_REVISION_PAGINATION,
  }),
  loader: async ({ context, deps, params }) => {
    const revisionPagination = buildPaginationInput(deps.pagination);

    const [revisions, paginationMetaData] =
      await api.list_revisions_by_document_id(
        BigInt(params.documentId),
        revisionPagination,
      );
    const document = await api.get_document(BigInt(params.documentId));

    return {
      context,
      document,
      pagination: revisionPagination,
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
  const [selected, setSelected] = useState<Entity[]>([]);
  const navigate = useNavigate();

  function handleCheckedChange(revisions: Entity[]) {
    setSelected(revisions);
  }

  const RowActions = (row: Row<Revision>) => {
    return (
      <Link
        params={{
          documentId,
          projectId,
          revisionId: row.id,
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
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    filters: [[filterCriteria]],
                  },
                },
                to: `/projects/${projectId}/documents/${documentId}`,
              });
            }}
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
              current:
                selected[1]?.id !== undefined
                  ? Number(selected[1].id)
                  : undefined,
              theirs:
                selected[0]?.id !== undefined
                  ? Number(selected[0].id)
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
                cellPreprocess: (v) => v,
                headerName: 'Version',
                id: 'version',
              },
              {
                cellPreprocess: (content) => {
                  return (
                    <div className="truncate max-w-md">
                      {new TextDecoder().decode(
                        new Uint8Array(content ? Object.values(content) : []),
                      )}
                    </div>
                  );
                },
                headerName: 'Content',
                id: 'content',
              },
              {
                cellPreprocess: (createdBy) => createdBy.toString(),
                headerName: 'Created by',
                id: 'created_by',
              },
              {
                cellPreprocess: (createdAt) => formatDateTime(createdAt),
                headerName: 'Created at',
                id: 'created_at',
              },
            ]}
            entityName={ENTITY_NAME.Revision}
            onSelectionChange={handleCheckedChange}
            onSortingChange={(newSort: Sort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: `/projects/${projectId}/documents/${documentId}`,
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={revisions}
          />
        </CardContent>
      </Card>
    </>
  );
}
