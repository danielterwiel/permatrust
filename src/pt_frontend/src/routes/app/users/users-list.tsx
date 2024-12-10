import { createFileRoute } from '@tanstack/react-router';
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
  SortCriteria,
  User,
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

const usersSearchSchema = z
  .object({
    pagination: paginationInputSchema.optional(),
  })
  .optional();

const DEFAULT_USER_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/',
)({
  validateSearch: zodSearchValidator(usersSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_USER_PAGINATION,
  }),
  loader: async ({ context, deps }) => {
    const userPagination = buildPaginationInput(deps.pagination);
    const [users, paginationMetaData] = await api.list_users(userPagination);
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
  const navigate = Route.useNavigate();

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
                to: '/users',
              });
            }}
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
                id: 'first_name',
              },
              {
                cellPreprocess: (lastName) => lastName,
                headerName: 'Last name',
                id: 'last_name',
              },
            ]}
            entityName={ENTITY_NAME.User}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/users',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={users}
          />
        </CardContent>
      </Card>
    </>
  );
}
