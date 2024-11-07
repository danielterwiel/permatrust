import { Link } from '@/components/Link';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/utils/formatDateTime';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { z } from 'zod';
import type { Row } from '@tanstack/react-table';
import type {
  Organisation,
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
      entity: ENTITY.Organisation,
      field: buildFilterField(
        ENTITY_NAME.Organisation,
        FILTER_FIELD.Organisation.Name,
      ),
      operator: FILTER_OPERATOR.Contains,
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
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_authenticated/_onboarded/organisations/',
)({
  component: Organisations,
  validateSearch: (search) => organisationsSearchSchema.parse(search),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ context, deps: { pagination } }) => {
    const organisationPagination = buildPaginationInput(
      DEFAULT_ORGANISATION_PAGINATION,
      pagination,
    );
    const [organisations, paginationMetaData] =
      await context.api.call.list_organisations(organisationPagination);

    return {
      context,
      organisations,
      paginationMetaData,
      pagination: organisationPagination,
    };
  },
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
      <Button variant="outline" onClick={setOrganisationIdLocalStorage}>
        Open
      </Button>
    );
  };

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            key={filterCriteria.entity.toString()}
            filterCriteria={filterCriteria}
            placeholder="Filter name..."
            onChange={(filterCriteria: FilterCriteria) => {
              navigate({
                to: '/organisations',
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
        <Link
          to="/organisations/create"
          variant="default"
          className="h-7 gap-1 ml-auto"
          size="sm"
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
              name="buildings-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Organisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Organisation>
            tableData={organisations}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.Organisation}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: '/organisations',
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
                id: 'name',
                headerName: 'Name',
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
  );
}
