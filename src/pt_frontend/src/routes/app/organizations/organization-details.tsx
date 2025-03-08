import { usePagination } from '@/hooks/use-pagination';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { getOrganizationOptions } from '@/api/queries/organizations';
import { getProjectsByOrganizationOptions } from '@/api/queries/projects';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { ENTITY } from '@/consts/entities';
import {
  FILTER_OPERATOR,
  FILTER_SORT_FIELDS,
  SORT_ORDER,
} from '@/consts/pagination';

import { createEntityPaginationSchema } from '@/schemas/pagination';
import { toNumberSchema } from '@/schemas/primitives';

import type { Project } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: projectsSearchSchema, defaultPagination } =
  createEntityPaginationSchema(ENTITY.PROJECT, {
    defaultFilterField: FILTER_SORT_FIELDS.PROJECT.NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.PROJECT.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/$organizationId/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  beforeLoad: () => ({
    getTitle: () => 'Organization',
  }),
  loader: async ({ context, deps, params }) => {
    const projectPagination = processPaginationInput(deps.pagination);
    const organizationId = toNumberSchema.parse(params.organizationId);

    const [projects, paginationMetaData] = await context.query.ensureQueryData(
      getProjectsByOrganizationOptions(organizationId, projectPagination),
    );

    const organization = await context.query.ensureQueryData(
      getOrganizationOptions(organizationId),
    );

    return {
      context,
      organization,
      pagination: projectPagination,
      paginationMetaData,
      projects,
    };
  },
  component: OrganizationDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganizationDetails() {
  const { organization, pagination, paginationMetaData, projects } =
    Route.useLoaderData();
  
  const effectiveSort = pagination.sort?.length 
    ? pagination.sort 
    : defaultPagination.sort;
  
  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination
  );

  const RowActions = (row: Row<Project>) => {
    return (
      <Link
        params={{
          projectId: row.id,
        }}
        to="/projects/$projectId"
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
            placeholder="Filter project name..."
          />
        ))}
        <Link
          className="h-7 gap-1"
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
              name="building-outline"
              size="lg"
            />
            {organization.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Project>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (v) => v,
                headerName: 'Project Name',
                key: 'name',
              },
              {
                cellPreprocess: (createdBy) => createdBy.toString(),
                headerName: 'Created by',
                key: 'created_by',
              },
              {
                cellPreprocess: (createdAt) => formatDateTime(createdAt),
                headerName: 'Created at',
                key: 'created_at',
              },
            ]}
            entityName={ENTITY.PROJECT}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            tableData={projects}
          />
        </CardContent>
      </Card>
    </>
  );
}
