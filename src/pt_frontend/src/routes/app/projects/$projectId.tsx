import { z } from 'zod';
import { api } from '@/api';
import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { paginationInputSchema } from '@/schemas/pagination';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/',
)({
  component: ProjectDetails,
  validateSearch: zodSearchValidator(projectsSearchSchema),
  beforeLoad: () => ({
    getTitle: () => 'Project',
  }),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_DOCUMENT_PAGINATION,
  }),
  loader: async ({ params, context, deps }) => {
    const documentPagination = buildPaginationInput(deps.pagination);
    const [documents, paginationMetaData] =
      await api.list_documents_by_project_id(
        BigInt(params.projectId),
        documentPagination,
      );
    const project = await api.get_project(BigInt(params.projectId));
    return {
      context,
      documents,
      paginationMetaData,
      pagination: documentPagination,
      project,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { documents, pagination, paginationMetaData, project } =
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
    <>
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
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-sm">
            Create Document
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="briefcase-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            {project.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
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
    </>
  );
}
