import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listUsersByProjectIdOptions } from '@/api/queries/users';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { toNumberSchema } from '@/schemas/primitives';
import { processPaginationInput } from '@/utils/pagination';

import { EmptyState } from '@/components/empty-state';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type {
  Role,
  User,
} from '@/declarations/tenant_canister/tenant_canister.did';
import type { Row } from '@tanstack/react-table';

const { schema: rolesSearchSchema, defaultPagination } = createPaginationSchema(
  ENTITY.USER,
  {
    defaultFilterField: FIELDS.USER.FIRST_NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.USER.FIRST_NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  },
);

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/assigned',
)({
  validateSearch: zodSearchValidator(rolesSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps, params }) => {
    const projectId = toNumberSchema.parse(params.projectId);
    const pagination = processPaginationInput(deps.pagination);
    const [users, paginationMetaData] = await context.query.ensureQueryData(
      listUsersByProjectIdOptions(projectId),
    );

    return {
      users,
      context,
      pagination,
      paginationMetaData,
    };
  },
  component: RolesAssigned,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<User>) => {
  const [firstRole] = row.original.roles;

  return (
    <Link
      params={{
        projectId: firstRole.project_id.toString(),
      }}
      search={{
        userId: toNumberSchema.parse(row.original.id),
      }}
      to="/projects/$projectId/roles/assign"
      variant="outline"
    >
      Open
    </Link>
  );
};

function RolesAssigned() {
  const { users, pagination, paginationMetaData } = Route.useLoaderData();

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
          {users.length === 0 ? (
            <EmptyState
              icon="user-check-outline"
              message="No roles assigned yet."
            />
          ) : (
            <Table<User>
              actions={RowActions}
              columnConfig={[
                {
                  cellPreprocess: (user) => user.last_name || '',
                  headerName: 'Last Name',
                  key: 'last_name',
                },
                {
                  cellPreprocess: (user) => user.first_name || '',
                  headerName: 'First Name',
                  key: 'first_name',
                },
                {
                  cellPreprocess: (user) =>
                    user.roles.map((role: Role) => role.name).join(', ') || '',
                  headerName: 'Roles',
                  key: 'roles',
                },
              ]}
              entityName={ENTITY.USER}
              getPageChangeParams={getPageChangeParams}
              onSortingChange={onSortChange}
              paginationMetaData={paginationMetaData}
              sort={effectiveSort}
              data={users}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
}
