import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listInvitesOptions } from '@/api/queries/invites';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Invite } from '@/declarations/tenant_canister/tenant_canister.did';

const { schema: invitesSearchSchema, defaultPagination } =
  createPaginationSchema(ENTITY.INVITE, {
    defaultFilterField: FIELDS.INVITE.ID,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.INVITE.CREATED_AT,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/invites/',
)({
  validateSearch: zodSearchValidator(invitesSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const invitePagination = processPaginationInput(deps.pagination);
    const [invites, paginationMetaData] = await context.query.ensureQueryData(
      listInvitesOptions({ pagination: invitePagination }),
    );
    return {
      context,
      pagination: invitePagination,
      paginationMetaData,
      invites,
    };
  },
  component: Invites,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Invites() {
  const { pagination, paginationMetaData, invites } = Route.useLoaderData();

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
            placeholder="Filter ID..."
          />
        ))}
        <Link
          className="h-7 gap-1 ml-auto"
          size="sm"
          to="/invites/create"
          variant="default"
        >
          <Icon name="user-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Invite user
          </span>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="user-outline"
              size="lg"
            />
            Invites
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Invite>
            columnConfig={[
              {
                cellPreprocess: (invite) => invite.id.toString(),
                headerName: 'ID',
                key: 'id',
              },
              {
                cellPreprocess: (invite) => invite.accepted_by.toString(),
                headerName: 'Accepted by',
                key: 'accepted_by',
              },
              {
                cellPreprocess: (invite) => {
                  const [acceptedAt] = invite.accepted_at;
                  if (acceptedAt === undefined) return 'NOT_APPLICABLE';
                  return formatDateTime(acceptedAt);
                },
                headerName: 'Accepted at',
                key: 'accepted_by',
              },
            ]}
            entityName={ENTITY.USER}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={invites}
          />
        </CardContent>
      </Card>
    </>
  );
}
