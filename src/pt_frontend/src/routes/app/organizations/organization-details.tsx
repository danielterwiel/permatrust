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
import { formatDateTime } from '@/utils/formatDateTime';

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

const projectsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_PROJECT_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/$organizationId/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_PROJECT_PAGINATION,
  }),
  beforeLoad: () => ({
    getTitle: () => 'Organization',
  }),
  loader: async ({ context, deps, params }) => {
    const projectPagination = buildPaginationInput(deps.pagination);
    const organizationIdNumber = toNumberSchema.parse(params.organizationId);

    const [projects, paginationMetaData] =
      await api.list_projects_by_organization_id(
        organizationIdNumber,
        projectPagination,
      );

    const organization = await api.get_organization(organizationIdNumber);

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
  const params = Route.useParams();
  const navigate = useNavigate();

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
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    filters: [[filterCriteria]],
                  },
                },
                to: `/organizations/${params.organizationId}`,
              });
            }}
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
                id: 'name',
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
            entityName={ENTITY_NAME.Project}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: `/organizations/${organization.id}`,
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
