import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { listProjectMembersRolesOptions } from '@/api/queries/users';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';

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
  Role,
  SortCriteria,
  UserWithRoles,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.User,
      field: buildFilterField(ENTITY_NAME.User, FILTER_FIELD.User.FirstName),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.User, FILTER_FIELD.User.FirstName),
    order: SORT_ORDER.Asc,
  },
];

const DEFAULT_ROLES_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

const rolesSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/assigned',
)({
  validateSearch: zodSearchValidator(rolesSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_ROLES_PAGINATION,
  }),
  loader: async ({ context, deps, params }) => {
    const projectId = toNumberSchema.parse(params.projectId);
    const rolePagination = buildPaginationInput(deps.pagination);
    const [assignedRoles, paginationMetaData] = await context.query.ensureQueryData(
      listProjectMembersRolesOptions({
        pagination: rolePagination,
        project_id: projectId,
      })
    );

    return {
      assignedRoles,
      context,
      pagination: rolePagination,
      paginationMetaData,
    };
  },
  component: RolesAssigned,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<UserWithRoles>) => {
  const [firstRole] = row.original.roles;

  return (
    <Link
      params={{
        projectId: firstRole?.project_id.toString(),
      }}
      search={{
        userId: toNumberSchema.parse(row.original.user.id),
      }}
      to="/projects/$projectId/roles/assign"
      variant="outline"
    >
      Open
    </Link>
  );
};

function RolesAssigned() {
  const { assignedRoles, pagination, paginationMetaData } =
    Route.useLoaderData();
  const navigate = useNavigate();
  const search = Route.useSearch();

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
                  ...search,
                  pagination: {
                    ...search.pagination,
                    filters: [[filterCriteria]],
                  },
                },
                to: '/projects/$projectId/roles/assigned',
              });
            }}
            placeholder="Filter by name..."
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="user-check-outline"
              size="lg"
            />
            Assigned Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          {assignedRoles.length === 0 ? (
            <div className="text-center text-muted-foreground">
              No roles assigned yet.
            </div>
          ) : (
            <Table<UserWithRoles>
              actions={RowActions}
              columnConfig={[
                {
                  cellPreprocess: (user) => user.last_name,
                  headerName: 'Last Name',
                  key: 'user',
                },
                {
                  cellPreprocess: (user) => user.first_name,
                  headerName: 'First Name',
                  key: 'user',
                },
                {
                  cellPreprocess: (roles) =>
                    roles?.map((role: Role) => role.name).join(', '),
                  headerName: 'Roles',
                  key: 'roles',
                },
              ]}
              entityName={ENTITY_NAME.User}
              onSortingChange={(newSort) => {
                navigate({
                  search: {
                    ...search,
                    pagination: {
                      ...(search.pagination ?? DEFAULT_ROLES_PAGINATION),
                      sort: newSort,
                    },
                  },
                  to: '/projects/$projectId/roles/assigned',
                });
              }}
              paginationMetaData={paginationMetaData}
              sort={pagination.sort}
              tableData={assignedRoles}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
