import { z } from 'zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { FilterInput } from '@/components/FilterInput';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import type { Row } from '@tanstack/react-table';
import type {
  User,
  PaginationInput,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination';
import { ENTITY, ENTITY_NAME } from '@/consts/entities';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      value: '',
      entity: ENTITY.User,
      field: buildFilterField(ENTITY_NAME.User, FILTER_FIELD.User.FirstName),
      operator: FILTER_OPERATOR.Contains,
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.User, FILTER_FIELD.User.FirstName),
    order: SORT_ORDER.Asc,
  },
];

const usersSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_USER_PAGINATION: PaginationInput = {
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute('/_authenticated/users/')({
  component: Users,
  validateSearch: (search) => usersSearchSchema.parse(search),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ context, deps: { pagination } }) => {
    const userPagination = buildPaginationInput(
      DEFAULT_USER_PAGINATION,
      pagination,
    );
    const [users, paginationMetaData] =
      await context.api.call.list_users(userPagination);
    return {
      context,
      users,
      paginationMetaData,
      pagination: userPagination,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<User>) => {
  return (
    <Link
      to="/users/$userId"
      variant="outline"
      params={{
        userId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Users() {
  const { users, pagination, paginationMetaData } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            key={filterCriteria.entity.toString()}
            filterCriteria={filterCriteria}
            placeholder="Filter first name..."
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                to: '/users',
                search: {
                  pagination: {
                    ...pagination,
                    filters: [[filterCriteria]],
                  },
                },
              });
            }}
          />
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="users-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<User>
            tableData={users}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.User}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: '/users',
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
              });
            }}
            columnConfig={[
              {
                id: 'first_name',
                headerName: 'First name',
                cellPreprocess: (firstName) => firstName,
              },
              {
                id: 'last_name',
                headerName: 'Last name',
                cellPreprocess: (lastName) => lastName,
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
