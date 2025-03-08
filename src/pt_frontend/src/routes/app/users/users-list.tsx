import { usePagination } from '@/hooks/use-pagination';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listUsersOptions } from '@/api/queries/users';

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

import type { User } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: usersSearchSchema, defaultPagination } =
  createEntityPaginationSchema(ENTITY.USER, {
    defaultFilterField: FILTER_SORT_FIELDS.USER.FIRST_NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.USER.FIRST_NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/',
)({
  validateSearch: zodSearchValidator(usersSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const userPagination = processPaginationInput(deps.pagination);
    const [users, paginationMetaData] = await context.query.ensureQueryData(
      listUsersOptions({ pagination: userPagination }),
    );
    return {
      context,
      pagination: userPagination,
      paginationMetaData,
      users,
    };
  },
  component: Users,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<User>) => {
  return (
    <Link
      params={{
        userId: row.id,
      }}
      to="/users/$userId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Users() {
  const { pagination, paginationMetaData, users } = Route.useLoaderData();
  
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
            placeholder="Filter first name..."
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="users-outline"
              size="lg"
            />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<User>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (firstName) => firstName,
                headerName: 'First name',
                key: 'first_name',
              },
              {
                cellPreprocess: (lastName) => lastName,
                headerName: 'Last name',
                key: 'last_name',
              },
            ]}
            entityName={ENTITY.USER}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            tableData={users}
          />
        </CardContent>
      </Card>
    </>
  );
}
