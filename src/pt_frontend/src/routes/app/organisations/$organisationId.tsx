import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
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
  Sort,
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
  '/_initialized/_authenticated/_onboarded/organisations/$organisationId/',
)({
  validateSearch: zodSearchValidator(projectsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_PROJECT_PAGINATION,
  }),
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  loader: async ({ context, deps, params }) => {
    const projectPagination = buildPaginationInput(deps.pagination);

    const [projects, paginationMetaData] =
      await api.list_projects_by_organisation_id(
        BigInt(Number.parseInt(params.organisationId)),
        projectPagination,
      );

    const organisation = await api.get_organisation(
      BigInt(Number.parseInt(params.organisationId)),
    );

    return {
      context,
      organisation,
      pagination: projectPagination,
      paginationMetaData,
      projects,
    };
  },
  component: OrganisationDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationDetails() {
  const { organisation, pagination, paginationMetaData, projects } =
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
                to: `/organisations/${params.organisationId}`,
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
            {organisation.name}
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
            onSortingChange={(newSort: Sort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: `/organisations/${organisation.id}`,
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
