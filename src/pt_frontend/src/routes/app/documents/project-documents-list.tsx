import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { api } from '@/api';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';

import { ENTITY, ENTITY_NAME } from '@/consts/entities';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination';

import { paginationInputSchema } from '@/schemas/pagination';
import { toNumberSchema } from '@/schemas/primitives';

import type {
  Document,
  PaginationInput,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Document,
      field: buildFilterField(
        ENTITY_NAME.Document,
        FILTER_FIELD.Document.Title,
      ),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.Document, FILTER_FIELD.Document.Title),
    order: SORT_ORDER.Asc,
  },
];

const documentsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_DOCUMENT_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/',
)({
  validateSearch: zodSearchValidator(documentsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_DOCUMENT_PAGINATION,
  }),
  loader: async ({ context, deps, params }) => {
    const documentPagination = buildPaginationInput(deps.pagination);
    const projectId = toNumberSchema.parse(params.projectId);
    const [documents, paginationMetaData] =
      await api.list_documents_by_project_id(projectId, documentPagination);

    return {
      context,
      documents,
      pagination: documentPagination,
      paginationMetaData,
    };
  },
  component: Documents,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Document>) => {
  return (
    <Link
      params={{
        documentId: row.id,
        projectId: row.original.project.toString(),
      }}
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Documents() {
  const { documents, pagination, paginationMetaData } = Route.useLoaderData();
  const { projectId } = Route.useParams();
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="files-outline"
            size="lg"
          />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
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
                  to: `/projects/${projectId}/documents`,
                });
              }}
              placeholder="Filter title..."
            />
          ))}
          <Link
            className="h-7 gap-1"
            params={{ projectId }}
            size="sm"
            to="/projects/$projectId/documents/create"
            variant="default"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create document
            </span>
          </Link>
        </div>
        <Table<Document>
          actions={RowActions}
          columnConfig={[
            {
              cellPreprocess: (title) => title,
              headerName: 'Title',
              id: 'title',
            },
            {
              cellPreprocess: (version) => version,
              headerName: 'Version',
              id: 'version',
            },
          ]}
          entityName={ENTITY_NAME.Document}
          onSortingChange={(newSort) => {
            navigate({
              search: {
                pagination: {
                  ...pagination,
                  sort: newSort,
                },
              },
              to: `/projects/${projectId}/documents`,
            });
          }}
          paginationMetaData={paginationMetaData}
          sort={pagination.sort}
          tableData={documents}
        />
      </CardContent>
    </Card>
  );
}
