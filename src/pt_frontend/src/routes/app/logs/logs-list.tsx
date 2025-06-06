import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listLogsOptions } from '@/api/queries/logs';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { formatDateTime } from '@/utils/format-date-time';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Table } from '@/components/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Log } from '@/declarations/tenant_canister/tenant_canister.did';

const { schema: logsSearchSchema, defaultPagination } = createPaginationSchema(
  ENTITY.LOG,
  {
    defaultFilterField: FIELDS.LOG.MESSAGE,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.LOG.TIMESTAMP,
    defaultSortOrder: SORT_ORDER.DESC,
  },
);

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/logs',
)({
  validateSearch: zodSearchValidator(logsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const pagination = processPaginationInput(deps.pagination);
    const [logs, paginationMetaData] = await context.query.ensureQueryData(
      listLogsOptions({
        pagination,
        level_filter: [],
        origin_filter: [],
      }),
    );
    return {
      context,
      pagination,
      paginationMetaData,
      logs,
    };
  },
  component: Logs,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function getLogLevelBadgeVariant(level: Log['level']) {
  if ('Error' in level) return 'destructive';
  if ('Warn' in level) return 'secondary';
  if ('Info' in level) return 'default';
  if ('Debug' in level) return 'outline';
  return 'default';
}

function getLogLevelText(level: Log['level']) {
  if ('Error' in level) return 'Error';
  if ('Warn' in level) return 'Warn';
  if ('Info' in level) return 'Info';
  if ('Debug' in level) return 'Debug';
  return 'Unknown';
}

function getOriginText(origin: Log['origin']) {
  if ('Main' in origin) return 'Main';
  if ('Tenant' in origin) return 'Tenant';
  if ('Upgrade' in origin) return 'Upgrade';
  return 'Unknown';
}

function Logs() {
  const { pagination, paginationMetaData, logs } = Route.useLoaderData();

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
            placeholder="Filter log messages..."
          />
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="logs"
              size="lg"
            />
            Logs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Log>
            columnConfig={[
              {
                cellPreprocess: (log) => formatDateTime(log.timestamp),
                headerName: 'Timestamp',
                key: 'timestamp',
              },
              {
                cellPreprocess: (log) => (
                  <Badge variant={getLogLevelBadgeVariant(log.level)}>
                    {getLogLevelText(log.level)}
                  </Badge>
                ),
                headerName: 'Level',
                key: 'level',
              },
              {
                cellPreprocess: (log) => getOriginText(log.origin),
                headerName: 'Origin',
                key: 'origin',
              },
              {
                cellPreprocess: (log) => (
                  <span className="font-mono text-sm">{log.message}</span>
                ),
                headerName: 'Message',
                key: 'message',
              },
            ]}
            entityName={ENTITY.LOG}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={logs}
          />
        </CardContent>
      </Card>
    </>
  );
}
