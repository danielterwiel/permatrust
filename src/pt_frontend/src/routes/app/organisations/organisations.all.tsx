import { useLocalStorage } from '@/hooks/useLocalStorage';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { api } from '@/api';

import { FilterInput } from '@/components/FilterInput';
import { Link } from '@/components/Link';
import { Table } from '@/components/Table';
import { Button } from '@/components/ui/button';
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
  Organisation,
  PaginationInput,
  Sort,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Organisation,
      field: buildFilterField(
        ENTITY_NAME.Organisation,
        FILTER_FIELD.Organisation.Name,
      ),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(
      ENTITY_NAME.Organisation,
      FILTER_FIELD.Organisation.Name,
    ),
    order: SORT_ORDER.Asc,
  },
];

const organisationsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_ORGANISATION_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/organisations/',
)({
  validateSearch: zodSearchValidator(organisationsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search?.pagination ?? DEFAULT_ORGANISATION_PAGINATION,
  }),
  loader: async ({ context, deps }) => {
    const organisationPagination = buildPaginationInput(deps.pagination);
    const [organisations, paginationMetaData] = await api.list_organisations(
      organisationPagination,
    );

    return {
      context,
      organisations,
      pagination: organisationPagination,
      paginationMetaData,
    };
  },
  component: Organisations,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organisations() {
  const { organisations, pagination, paginationMetaData } =
    Route.useLoaderData();
  const [_activeOrganisationId, setActiveOrganisationId] = useLocalStorage(
    'activeOrganisationId',
    '',
  );
  const navigate = useNavigate();

  const RowActions = (row: Row<Organisation>) => {
    const setOrganisationIdLocalStorage = () => {
      setActiveOrganisationId(row.id);
      navigate({ to: `/organisations/${row.id}` });
    };

    return (
      <Button onClick={setOrganisationIdLocalStorage} variant="outline">
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
                to: '/organisations',
              });
            }}
            placeholder="Filter name..."
          />
        ))}
        <Link
          className="h-7 gap-1 ml-auto"
          size="sm"
          to="/organisations/create"
          variant="default"
        >
          <Icon name="building-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Organisation
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
            Organisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Organisation>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (v) => v,
                headerName: 'Name',
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
            entityName={ENTITY_NAME.Organisation}
            onSortingChange={(newSort: Sort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/organisations',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={organisations}
          />
        </CardContent>
      </Card>
    </>
  );
}
