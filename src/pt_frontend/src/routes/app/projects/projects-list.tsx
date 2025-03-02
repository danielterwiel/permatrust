import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { listProjectsOptions } from '@/api/queries/projects';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { formatDateTime } from '@/utils/formatDateTime';

import { ENTITY, ENTITY_NAME } from '@/consts/entities';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination';

import { paginationInputSchema } from '@/schemas/pagination';

import type {
  PaginationInput,
  Project,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Project,
      field: buildFilterField(ENTITY_NAME.Project, FILTER_FIELD.Project.Name),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.Project, FILTER_FIELD.Project.Name),
    order: SORT_ORDER.Asc,
  },
];

const DEFAULT_PROJECT_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

const projectsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_PROJECT_PAGINATION,
  }),
  loader: async ({ context, deps }) => {
    const projectPagination = buildPaginationInput(deps.pagination);
    const [projects, paginationMetaData] = await context.query.ensureQueryData(
      listProjectsOptions(projectPagination)
    );
    return {
      context,
      pagination: projectPagination,
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
        projectId: row.id,
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
  const navigate = useNavigate();

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
                to: '/projects',
              });
            }}
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
                cellPreprocess: (v) => v,
                headerName: 'Name',
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
            entityName={ENTITY_NAME.Project}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/projects',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={projects}
          />
        </CardContent>
      </Card>
    </>
  );
}
