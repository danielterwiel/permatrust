import { Link } from '@/components/Link';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import { z } from 'zod';
import type {
  Document,
  PaginationInput,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';
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

const projectsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_DOCUMENT_PAGINATION: PaginationInput = {
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute('/_authenticated/projects/$projectId/')({
  component: ProjectDetails,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Project',
  }),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ params: { projectId }, context, deps: { pagination } }) => {
    const documentPagination = buildPaginationInput(
      DEFAULT_DOCUMENT_PAGINATION,
      pagination,
    );
    const [documents, paginationMetaData] =
      await context.api.call.list_documents_by_project_id(
        BigInt(projectId),
        documentPagination,
      );
    const project = await context.api.call.get_project(BigInt(projectId));
    return {
      context,
      documents,
      paginationMetaData,
      pagination: documentPagination,
      active: {
        project,
      },
      projectId,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { documents, pagination, paginationMetaData, active } =
    Route.useLoaderData();
  const navigate = useNavigate();

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="briefcase-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          {active.project.name}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-4">
          {pagination.filters[0]?.map((filterCriteria) => (
            <FilterInput
              key={filterCriteria.entity.toString()}
              filterCriteria={filterCriteria}
              placeholder="Filter document title..."
              onChange={(filterCriteria: FilterCriteria) => {
                navigate({
                  to: `/projects/${projectId}`,
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
              Create Document
            </span>
          </Link>
        </div>
        <Table<Document>
          tableData={documents}
          paginationMetaData={paginationMetaData}
          entityName={ENTITY_NAME.Document}
          sort={pagination.sort}
          onSortingChange={(newSort: Sort) => {
            navigate({
              to: `/projects/${projectId}`,
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
              id: 'title',
              headerName: 'Document Title',
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
