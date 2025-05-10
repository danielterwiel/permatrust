import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listProjectsOptions } from '@/api/queries/projects';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Project } from '@/declarations/tenant_canister/tenant_canister.did';
import type { Row } from '@tanstack/react-table';

const { schema: projectsSearchSchema, defaultPagination } =
  createPaginationSchema(ENTITY.PROJECT, {
    defaultFilterField: FIELDS.PROJECT.NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.PROJECT.CREATED_AT,
    defaultSortOrder: SORT_ORDER.DESC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const pagination = processPaginationInput(deps.pagination);
    const [projects, paginationMetaData] = await context.query.ensureQueryData(
      listProjectsOptions({ pagination }),
    );
    return {
      context,
      pagination,
      paginationMetaData,
      projects,
    };
  },
  component: Projects,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Project>) => {
  return (
    <Link
      params={{
        projectId: row.original.id.toString(),
      }}
      to="/projects/$projectId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Projects() {
  const { pagination, paginationMetaData, projects } = Route.useLoaderData();

  const effectiveSort = pagination.sort.length
    ? pagination.sort
    : defaultPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination,
  );

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            filterCriteria={filterCriteria}
            key={filterCriteria.entity.toString()}
            onChange={onFilterChange}
            placeholder="Filter project name..."
          />
        ))}

        <Link
          className="h-7 gap-1 ml-auto"
          size="sm"
          to="/projects/create"
          variant="default"
        >
          <Icon name="briefcase-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create project
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="briefcase-outline"
              size="lg"
            />
            Projects
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Project>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (project) => project.name,
                headerName: 'Name',
                key: 'name',
              },
              {
                cellPreprocess: (project) => project.created_by.toString(),
                headerName: 'Created by',
                key: 'created_by',
              },
              {
                cellPreprocess: (project) => formatDateTime(project.created_at),
                headerName: 'Created at',
                key: 'created_at',
              },
            ]}
            entityName={ENTITY.PROJECT}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={projects}
          />
        </CardContent>
      </Card>
    </>
  );
}
