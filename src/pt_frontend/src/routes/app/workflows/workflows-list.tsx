import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listWorkflowsOptions } from '@/api/queries/workflows';
import { usePagination } from '@/hooks/use-pagination';
import { createPaginationSchema } from '@/schemas/pagination';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type { Workflow } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: workflowsSearchSchema, defaultPagination } =
  createPaginationSchema(ENTITY.WORKFLOW, {
    defaultFilterField: FIELDS.WORKFLOW.NAME,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FIELDS.WORKFLOW.NAME,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/',
)({
  validateSearch: zodSearchValidator(workflowsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps }) => {
    const workflowPagination = processPaginationInput(deps.pagination);
    const [workflows, paginationMetaData] = await context.query.ensureQueryData(
      listWorkflowsOptions(workflowPagination),
    );

    return {
      context,
      pagination: workflowPagination,
      paginationMetaData,
      workflows,
    };
  },
  component: Workflows,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Workflow>) => {
  return (
    <Link
      params={{
        workflowId: row.id,
      }}
      to="/workflows/$workflowId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Workflows() {
  const { pagination, paginationMetaData, workflows } = Route.useLoaderData();

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
          className="h-7 gap-1"
          size="sm"
          to="/workflows/create"
          variant="default"
        >
          <Icon name="file-orientation-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create workflow
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="file-orientation-outline"
              size="lg"
            />
            Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Workflow>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (workflow) => workflow.name,
                headerName: 'Name',
                key: 'name',
              },
            ]}
            entityName={ENTITY.WORKFLOW}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={workflows}
          />
        </CardContent>
      </Card>
    </>
  );
}
