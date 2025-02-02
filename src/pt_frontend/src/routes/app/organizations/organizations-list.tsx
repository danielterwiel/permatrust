import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { api } from '@/api';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
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

import type {
  Organization,
  PaginationInput,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Organization,
      field: buildFilterField(
        ENTITY_NAME.Organization,
        FILTER_FIELD.Organization.Name,
      ),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(
      ENTITY_NAME.Organization,
      FILTER_FIELD.Organization.Name,
    ),
    order: SORT_ORDER.Asc,
  },
];

const organizationsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_ORGANIZATION_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organizations/',
)({
  validateSearch: zodSearchValidator(organizationsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_ORGANIZATION_PAGINATION,
  }),
  loader: async ({ context, deps }) => {
    const organizationPagination = buildPaginationInput(deps.pagination);
    const [organizations, paginationMetaData] = await api.list_organizations(
      organizationPagination,
    );

    return {
      context,
      organizations,
      pagination: organizationPagination,
      paginationMetaData,
    };
  },
  component: Organizations,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organizations() {
  const { organizations, pagination, paginationMetaData } =
    Route.useLoaderData();
  const [_activeOrganizationId, setActiveOrganizationId] = useLocalStorage(
    'activeOrganizationId',
    '',
  );
  const navigate = useNavigate();

  const RowActions = (row: Row<Organization>) => {
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
                to: '/organizations',
              });
            }}
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
                cellPreprocess: (v) => v,
                headerName: 'Name',
                key: 'name',
              },
              {
                cellPreprocess: (createdBy) => createdBy.toString(),
                headerName: 'Created by',
                key: 'created_by',
              },
              {
                cellPreprocess: (createdAt) => formatDateTime(createdAt),
                headerName: 'Created at',
                key: 'created_at',
              },
            ]}
            entityName={ENTITY_NAME.Organization}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/organizations',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={organizations}
          />
        </CardContent>
      </Card>
    </>
  );
}
