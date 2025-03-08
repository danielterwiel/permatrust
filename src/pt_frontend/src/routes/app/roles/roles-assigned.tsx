import { usePagination } from '@/hooks/use-pagination';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listProjectMembersRolesOptions } from '@/api/queries/users';

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
import { toNumberSchema } from '@/schemas/primitives';

import type {
  Role,
  UserWithRoles,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: rolesSearchSchema, defaultPagination } =
  createEntityPaginationSchema(ENTITY.USER_WITH_ROLES, {
    defaultFilterField: FILTER_SORT_FIELDS.USER_WITH_ROLES.FIRST_NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.USER_WITH_ROLES.FIRST_NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/assigned',
)({
  validateSearch: zodSearchValidator(rolesSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps, params }) => {
    const projectId = toNumberSchema.parse(params.projectId);
    const rolePagination = processPaginationInput(deps.pagination);
    const [assignedRoles, paginationMetaData] =
      await context.query.ensureQueryData(
        listProjectMembersRolesOptions({
          pagination: rolePagination,
          project_id: projectId,
        }),
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
  
  const effectiveSort = pagination.sort?.length 
    ? pagination.sort 
    : defaultPagination.sort;
  
  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination
  );

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            filterCriteria={filterCriteria}
            key={filterCriteria.entity.toString()}
            onChange={onFilterChange}
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
              entityName={ENTITY.USER_WITH_ROLES}
              getPageChangeParams={getPageChangeParams}
              onSortingChange={onSortChange}
              paginationMetaData={paginationMetaData}
              sort={effectiveSort}
              tableData={assignedRoles}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
