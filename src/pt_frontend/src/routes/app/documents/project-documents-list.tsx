import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';

import { listDocumentsByProjectIdOptions } from '@/api/queries/documents';
import { usePagination } from '@/hooks/use-pagination';
import { projectIdSchema } from '@/schemas/entities';
import { createEntityPaginationSchema } from '@/schemas/pagination';
import { processPaginationInput } from '@/utils/pagination';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { ENTITY } from '@/consts/entities';
import {
  FILTER_OPERATOR,
  FILTER_SORT_FIELDS,
  SORT_ORDER,
} from '@/consts/pagination';

import type { Document } from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const { schema: documentsSearchSchema, defaultPagination } =
  createEntityPaginationSchema(ENTITY.DOCUMENT, {
    defaultFilterField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
    defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
    defaultFilterValue: '',
    defaultSortField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
    defaultSortOrder: SORT_ORDER.ASC,
  });

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/documents/',
)({
  validateSearch: zodSearchValidator(documentsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...defaultPagination, ...search?.pagination },
  }),
  loader: async ({ context, deps, params }) => {
    const documentPagination = processPaginationInput(deps.pagination);
    const projectId = projectIdSchema.parse(params.projectId);
    const [documents, paginationMetaData] = await context.query.ensureQueryData(
      listDocumentsByProjectIdOptions({
        pagination: documentPagination,
        project_id: projectId,
      }),
    );

    return {
      context,
      documents,
      pagination: documentPagination,
      paginationMetaData,
    };
  },
  component: Documents,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Document>) => {
  return (
    <Link
      params={{
        documentId: row.original.id.toString(),
        projectId: row.original.project_id.toString(),
      }}
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Documents() {
  const { documents, pagination, paginationMetaData } = Route.useLoaderData();
  const { projectId } = Route.useParams();

  const effectiveSort = pagination.sort.length
    ? pagination.sort
    : defaultPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    defaultPagination,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="files-outline"
            size="lg"
          />
          Documents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between pb-4">
          {pagination.filters[0]?.map((filterCriteria) => (
            <FilterInput
              filterCriteria={filterCriteria}
              key={filterCriteria.entity.toString()}
              onChange={onFilterChange}
              placeholder="Filter title..."
            />
          ))}
          <Link
            className="h-7 gap-1"
            params={{ projectId }}
            size="sm"
            to="/projects/$projectId/documents/create"
            variant="default"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create document
            </span>
          </Link>
        </div>
        <Table<Document>
          actions={RowActions}
          columnConfig={[
            {
              cellPreprocess: (title) => title,
              headerName: 'Title',
              key: 'title',
            },
            {
              cellPreprocess: (version) => version,
              headerName: 'Version',
              key: 'version',
            },
          ]}
          entityName={ENTITY.DOCUMENT}
          getPageChangeParams={getPageChangeParams}
          onSortingChange={onSortChange}
          paginationMetaData={paginationMetaData}
          sort={effectiveSort}
          tableData={documents}
        />
      </CardContent>
    </Card>
  );
}
