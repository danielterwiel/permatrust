import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listOrganizationsOptions } from '@/api/queries/organizations';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Organization } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: organizationsSearchSchema, defaultPagination } =
  createPaginationSchema(ENTITY.ORGANIZATION, {
    defaultFilterField: FIELDS.ORGANIZATION.NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.ORGANIZATION.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/',
)({
  validateSearch: zodSearchValidator(organizationsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const pagination = processPaginationInput(deps.pagination);
    const [organizations, paginationMetaData] =
      await context.query.ensureQueryData(listOrganizationsOptions(pagination));

    return {
      context,
      organizations,
      pagination,
      paginationMetaData,
    };
  },
  component: Organizations,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Organization>) => {
  const [_activeOrganizationId, setActiveOrganizationId] = useLocalStorage(
    'activeOrganizationId',
    '',
  );
  const navigate = useNavigate();

  const setOrganizationIdLocalStorage = () => {
    setActiveOrganizationId(row.id);
    navigate({ to: `/organizations/${row.id}` });
  };

  return (
    <Button onClick={setOrganizationIdLocalStorage} variant="outline">
      Open
    </Button>
  );
};

function Organizations() {
  const { organizations, pagination, paginationMetaData } =
    Route.useLoaderData();

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
            placeholder="Filter name..."
          />
        ))}
        <Link
          className="h-7 gap-1 ml-auto"
          size="sm"
          to="/organizations/create"
          variant="default"
        >
          <Icon name="building-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create organization
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="buildings-outline"
              size="lg"
            />
            Organizations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Organization>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (organization) => organization.name,
                headerName: 'Name',
                key: 'name',
              },
              {
                cellPreprocess: (organization) =>
                  organization.created_by.toString(),
                headerName: 'Created by',
                key: 'created_by',
              },
              {
                cellPreprocess: (organization) =>
                  formatDateTime(organization.created_at),
                headerName: 'Created at',
                key: 'created_at',
              },
            ]}
            entityName={ENTITY.ORGANIZATION}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={organizations}
          />
        </CardContent>
      </Card>
    </>
  );
}
