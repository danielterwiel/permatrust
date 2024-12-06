import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { api } from '@/api';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/data-table';
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
  Workflow,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Workflow,
      field: buildFilterField(ENTITY_NAME.Workflow, FILTER_FIELD.Workflow.Name),
      operator: FILTER_OPERATOR.Contains,
      value: '',
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
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/workflows/',
)({
  validateSearch: zodSearchValidator(workflowsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: search.pagination ?? DEFAULT_WORKFLOW_PAGINATION,
  }),
  loader: async ({ context, deps }) => {
    const workflowPagination = buildPaginationInput(deps.pagination);
    const [workflows, paginationMetaData] =
      await api.list_workflows(workflowPagination);

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
  const navigate = useNavigate();

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
                to: '/workflows',
              });
            }}
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
                cellPreprocess: (name) => name,
                headerName: 'Name',
                id: 'name',
              },
            ]}
            entityName={ENTITY_NAME.Workflow}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/workflows',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={workflows}
          />
        </CardContent>
      </Card>
    </>
  );
}
