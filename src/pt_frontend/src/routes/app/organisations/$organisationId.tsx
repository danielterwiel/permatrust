import { Link } from '@/components/Link'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Table } from '@/components/Table'
import { Icon } from '@/components/ui/Icon'
import { FilterInput } from '@/components/FilterInput'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDateTime } from '@/utils/formatDateTime'
import { buildPaginationInput } from '@/utils/buildPaginationInput'
import { buildFilterField } from '@/utils/buildFilterField'
import { paginationInputSchema } from '@/schemas/pagination'
import { z } from 'zod'
import type { Row } from '@tanstack/react-table'
import type {
  Project,
  PaginationInput,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did'
import type { FilterCriteria } from '@/types/pagination'
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination'
import { ENTITY, ENTITY_NAME } from '@/consts/entities'

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      value: '',
      entity: ENTITY.Project,
      field: buildFilterField(ENTITY_NAME.Project, FILTER_FIELD.Project.Name),
      operator: FILTER_OPERATOR.Contains,
    },
  ],
]

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.Project, FILTER_FIELD.Project.Name),
    order: SORT_ORDER.Asc,
  },
]

const projectsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
})

const DEFAULT_PROJECT_PAGINATION: PaginationInput = {
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
}

export const Route = createFileRoute(
  '/_authenticated/_onboarded/organisations/$organisationId/',
)({
  component: OrganisationDetails,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ context, deps: { pagination }, params }) => {
    const projectPagination = buildPaginationInput(
      DEFAULT_PROJECT_PAGINATION,
      pagination,
    )
    const [projects, paginationMetaData] =
      await context.api.call.list_projects_by_organisation_id(
        BigInt(Number.parseInt(params.organisationId)),
        projectPagination,
      )
    const organisation = await context.api.call.get_organisation(
      BigInt(Number.parseInt(params.organisationId)),
    )

    return {
      context,
      projects,
      paginationMetaData,
      pagination: projectPagination,
      active: {
        organisation,
      },
    }
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>
  },
})

function OrganisationDetails() {
  const { projects, pagination, paginationMetaData, active } =
    Route.useLoaderData()
  const navigate = useNavigate()

  const RowActions = (row: Row<Project>) => {
    return (
      <Link
        to="/projects/$projectId"
        variant="outline"
        params={{
          projectId: row.id,
        }}
      >
        Open
      </Link>
    )
  }

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            key={filterCriteria.entity.toString()}
            filterCriteria={filterCriteria}
            placeholder="Filter project name..."
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                to: `/organisations/${active.organisation.id}`,
                search: {
                  pagination: {
                    ...pagination,
                    filters: [[filterCriteria]],
                  },
                },
              })
            }}
          />
        ))}
        <Link
          to="/projects/create"
          variant="default"
          className="h-7 gap-1"
          size="sm"
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
              name="building-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            {active.organisation.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Project>
            tableData={projects}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.Project}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: `/organisations/${active.organisation.id}`,
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
              })
            }}
            columnConfig={[
              {
                id: 'name',
                headerName: 'Project Name',
                cellPreprocess: (v) => v,
              },
              {
                id: 'created_by',
                headerName: 'Created by',
                cellPreprocess: (createdBy) => createdBy.toString(),
              },
              {
                id: 'created_at',
                headerName: 'Created at',
                cellPreprocess: (createdAt) => formatDateTime(createdAt),
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  )
}
