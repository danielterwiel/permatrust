import { z } from 'zod';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Table } from '@/components/Table';
import { Icon } from '@/components/ui/Icon';
import { Link } from '@/components/Link';
import { FilterInput } from '@/components/FilterInput';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { buildFilterField } from '@/utils/buildFilterField';
import { paginationInputSchema } from '@/schemas/pagination';
import type { Row } from '@tanstack/react-table';
import type {
  Workflow,
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
      entity: ENTITY.Workflow,
      field: buildFilterField(ENTITY_NAME.Workflow, FILTER_FIELD.Workflow.Name),
      operator: FILTER_OPERATOR.Contains,
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.Workflow, FILTER_FIELD.Workflow.Name),
    order: SORT_ORDER.Asc,
  },
];

const workflowsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_WORKFLOW_PAGINATION: PaginationInput = {
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute('/_authenticated/_onboarded/workflows/')({
  component: Workflows,
  validateSearch: (search) => workflowsSearchSchema.parse(search),
  loaderDeps: ({ search: { pagination } }) => ({ pagination }),
  loader: async ({ context, deps: { pagination } }) => {
    const workflowPagination = buildPaginationInput(
      DEFAULT_WORKFLOW_PAGINATION,
      pagination,
    );
    const [workflows, paginationMetaData] =
      await context.api.call.list_workflows(workflowPagination);
    return {
      context,
      workflows,
      paginationMetaData,
      pagination: workflowPagination,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Workflow>) => {
  return (
    <Link
      to="/workflows/$workflowId"
      variant="outline"
      params={{
        workflowId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Workflows() {
  const { workflows, pagination, paginationMetaData } = Route.useLoaderData();
  const navigate = useNavigate();

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
                to: '/workflows',
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
          to="/workflows/create"
          variant="default"
          className="h-7 gap-1"
          size="sm"
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
              name="file-orientation-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Workflows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Workflow>
            tableData={workflows}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.Workflow}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: '/workflows',
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
                cellPreprocess: (name) => name,
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
