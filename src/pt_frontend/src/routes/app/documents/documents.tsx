import { Link } from '@/components/Link';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import { z } from 'zod';
import type { Row } from '@tanstack/react-table';
import type {
  Document,
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
      entity: ENTITY.Document,
      field: buildFilterField(
        ENTITY_NAME.Document,
        FILTER_FIELD.Document.Title,
      ),
      operator: FILTER_OPERATOR.Contains,
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
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_authenticated/_onboarded/projects/$projectId/documents/',
)({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ context, params, deps: { pagination } }) => {
    const documentPagination = buildPaginationInput(
      DEFAULT_DOCUMENT_PAGINATION,
      pagination,
    );
    const [documents, paginationMetaData] =
      await context.api.call.list_documents_by_project_id(
        BigInt(params.projectId),
        documentPagination,
      );
    return {
      context,
      documents,
      paginationMetaData,
      pagination: documentPagination,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Document>) => {
  return (
    <Link
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
      params={{
        projectId: row.original.project.toString(),
        documentId: row.id,
      }}
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
            name="files-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-4">
          {pagination.filters[0]?.map((filterCriteria) => (
            <FilterInput
              key={filterCriteria.entity.toString()}
              filterCriteria={filterCriteria}
              placeholder="Filter title..."
              onChange={(filterCriteria: FilterCriteria) => {
                navigate({
                  to: `/projects/${projectId}/documents`,
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
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId }}
            variant="default"
            className="h-7 gap-1"
            size="sm"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create document
            </span>
          </Link>
        </div>
        <Table<Document>
          tableData={documents}
          actions={RowActions}
          paginationMetaData={paginationMetaData}
          entityName={ENTITY_NAME.Document}
          sort={pagination.sort}
          onSortingChange={(newSort: Sort) => {
            navigate({
              to: `/projects/${projectId}/documents`,
              search: {
                pagination: {
                  ...pagination,
                  sort: newSort,
                },
              },
            });
          }}
          columnConfig={[
            {
              id: 'title',
              headerName: 'Title',
              cellPreprocess: (title) => title,
            },
            {
              id: 'version',
              headerName: 'Version',
              cellPreprocess: (version) => version,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
