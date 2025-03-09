import { usePagination } from '@/hooks/use-pagination';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listDocumentsByProjectIdOptions } from '@/api/queries/documents';
import { getProjectOptions } from '@/api/queries/projects';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { processPaginationInput } from '@/utils/pagination';

import { ENTITY } from '@/consts/entities';
import {
  FILTER_OPERATOR,
  FILTER_SORT_FIELDS,
  SORT_ORDER,
} from '@/consts/pagination';

import { createEntityPaginationSchema } from '@/schemas/pagination';

import type { Document } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: projectsSearchSchema, defaultPagination } =
  createEntityPaginationSchema(ENTITY.DOCUMENT, {
    defaultFilterField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps, params }) => {
    const documentPagination = processPaginationInput(deps.pagination);
    const projectId = Number(params.projectId);
    const project = await context.query.ensureQueryData(
      getProjectOptions(projectId),
    );

    const [documents, paginationMetaData] = await context.query.ensureQueryData(
      listDocumentsByProjectIdOptions({
        pagination: documentPagination,
        project_id: projectId,
      }),
    );
    return {
      context,
      documents,
      pagination: documentPagination,
      paginationMetaData,
      project,
    };
  },
  component: ProjectDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function ProjectDetails() {
  const { projectId } = Route.useParams();
  const { documents, pagination, paginationMetaData, project } =
    Route.useLoaderData();

  const effectiveSort = pagination.sort?.length
    ? pagination.sort
    : defaultPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination,
  );

  const RowActions = (row: Row<Document>) => {
    return (
      <Link
        params={{
          documentId: row.id,
          projectId: row.original.project_id.toString(),
        }}
        to="/projects/$projectId/documents/$documentId"
        variant="outline"
      >
        Open
      </Link>
    );
  };

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between pb-4">
          {pagination.filters[0]?.map((filterCriteria) => (
            <FilterInput
              filterCriteria={filterCriteria}
              key={filterCriteria.entity.toString()}
              onChange={onFilterChange}
              placeholder="Filter document title..."
            />
          ))}

          <div className="flex gap-4">
            <Link
              className="h-5 gap-1"
              params={{ projectId }}
              size="sm"
              to="/projects/$projectId/roles/list"
              variant="secondary"
            >
              <Icon name="user-check-outline" size="xs" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-xs">
                Manage Roles
              </span>
            </Link>
            <Link
              className="h-7 gap-1"
              params={{ projectId }}
              size="sm"
              to="/projects/$projectId/documents/create"
              variant="default"
            >
              <Icon name="file-outline" size="sm" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-sm">
                Create Document
              </span>
            </Link>
          </div>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>
              <Icon
                className="text-muted-foreground pb-1 mr-2"
                name="briefcase-outline"
                size="lg"
              />
              {project.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table<Document>
              actions={RowActions}
              columnConfig={[
                {
                  cellPreprocess: (title) => title,
                  headerName: 'Title',
                  key: 'title',
                },
                {
                  cellPreprocess: (version) => version,
                  headerName: 'Version',
                  key: 'version',
                },
              ]}
              entityName={ENTITY.DOCUMENT}
              getPageChangeParams={getPageChangeParams}
              onSortingChange={onSortChange}
              paginationMetaData={paginationMetaData}
              sort={effectiveSort}
              tableData={documents}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
