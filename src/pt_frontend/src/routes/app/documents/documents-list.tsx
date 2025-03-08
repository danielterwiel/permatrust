import { usePagination } from '@/hooks/use-pagination';
import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useState } from 'react';

import { listDocumentsOptions } from '@/api/queries/documents';
import { getProjectsByOrganizationOptions } from '@/api/queries/projects';

import { Table } from '@/components/data-table';
import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { getActiveOrganizationId } from '@/utils/get-active-organizationId';
import { processPaginationInput } from '@/utils/pagination';

import { ENTITY } from '@/consts/entities';
import {
  DEFAULT_PAGINATION,
  FILTER_OPERATOR,
  FILTER_SORT_FIELDS,
  SORT_ORDER,
} from '@/consts/pagination';

import { createEntityPaginationSchema } from '@/schemas/pagination';

import type {
  Document,
  Project,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const {
  schema: documentsSearchSchema,
  defaultPagination: documentsPagination,
} = createEntityPaginationSchema(ENTITY.DOCUMENT, {
  defaultFilterField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
  defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
  defaultFilterValue: '',
  defaultSortField: FILTER_SORT_FIELDS.DOCUMENT.TITLE,
  defaultSortOrder: SORT_ORDER.ASC,
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/documents',
)({
  validateSearch: zodSearchValidator(documentsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...documentsPagination, ...search?.pagination },
  }),
  beforeLoad: () => ({
    getTitle: () => 'Documents',
  }),
  loader: async ({ context, deps }) => {
    const activeOrganizationId = getActiveOrganizationId();
    const documentPagination = processPaginationInput(deps.pagination);
    const projectPagination = processPaginationInput(DEFAULT_PAGINATION);

    const [projects] = await context.query.ensureQueryData(
      getProjectsByOrganizationOptions(activeOrganizationId, projectPagination),
    );

    const [documents, paginationMetaData] = await context.query.ensureQueryData(
      listDocumentsOptions({
        pagination: documentPagination,
        project_id: projects[0]?.id || 0, // TODO: selectable
      }),
    );

    return {
      context,
      documents,
      pagination: documentPagination,
      paginationMetaData,
      projects,
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
        documentId: row.id,
        projectId: row.original.project.toString(),
      }}
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
    >
      Open
    </Link>
  );
};

function Documents() {
  const { documents, pagination, paginationMetaData, projects } =
    Route.useLoaderData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  const effectiveSort = pagination.sort?.length
    ? pagination.sort
    : documentsPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    documentsPagination
  );

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => (
          <FilterInput
            filterCriteria={filterCriteria}
            key={filterCriteria.entity.toString()}
            onChange={onFilterChange}
            placeholder="Filter title..."
          />
        ))}
        {projects.length === 1 ? (
          <Link
            className="h-7 gap-1"
            params={{ projectId: projects[0]?.id.toString() }}
            size="sm"
            to="/projects/$projectId/documents/create"
            variant="default"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-sm">
              Create document
            </span>
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="default">
                <Icon name="file-outline" size="xs" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Create document
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="mr-8">
              <Select
                onValueChange={(projectId) => setSelectedProjectId(projectId)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map((project: Project) => (
                      <SelectItem
                        key={project.id}
                        value={project.id.toString()}
                      >
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Link
                className="mt-4"
                disabled={!selectedProjectId}
                params={{ projectId: selectedProjectId }}
                to="/projects/$projectId/documents/create"
                variant="default"
              >
                <Icon className="mr-2" name="file-outline" size="sm" />
                Create document
              </Link>
            </PopoverContent>
          </Popover>
        )}
      </div>
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
          <Table<Document>
            actions={RowActions}
            columnConfig={[
              {
                cellPreprocess: (title) => title,
                headerName: 'Document title',
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
    </>
  );
}
