import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useState } from 'react';

import { listDocumentsOptions } from '@/api/queries/documents';
import { listProjectsByOrganizationIdOptions } from '@/api/queries/projects';
import { usePagination } from '@/hooks/use-pagination';
import { createPagination, createPaginationSchema } from '@/schemas/pagination';
import { getActiveOrganizationId } from '@/utils/get-active-organizationId';
import { processPaginationInput } from '@/utils/pagination';

import { FilterInput } from '@/components/filter-input';
import { Link } from '@/components/link';
import { Table } from '@/components/table';
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

import { ENTITY } from '@/consts/entities';
import { FIELDS, FILTER_OPERATOR, SORT_ORDER } from '@/consts/pagination';

import type {
  Document,
  Project,
} from '@/declarations/pt_backend/pt_backend.did';
import type { Row } from '@tanstack/react-table';

const {
  schema: documentsSearchSchema,
  defaultPagination: documentsPagination,
} = createPaginationSchema(ENTITY.DOCUMENT, {
  defaultFilterField: FIELDS.DOCUMENT.TITLE,
  defaultFilterOperator: FILTER_OPERATOR.CONTAINS,
  defaultFilterValue: '',
  defaultSortField: FIELDS.DOCUMENT.TITLE,
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
    const pagination = processPaginationInput(deps.pagination);

    const [projects] = await context.query.ensureQueryData(
      listProjectsByOrganizationIdOptions({
        organizationId: activeOrganizationId,
      }),
    );

    const projectId = projects[0].id;

    if (!projectId) {
      throw new Error('Not implemented');
    }

    const defaultPagination = createPagination(ENTITY.DOCUMENT, {
      defaultFilterField: FIELDS.DOCUMENT.PROJECT_ID,
      defaultFilterOperator: FILTER_OPERATOR.EQUALS,
      defaultFilterValue: projectId.toString(),
      defaultSortField: FIELDS.DOCUMENT.TITLE,
      defaultSortOrder: SORT_ORDER.ASC,
    });

    const [documents, paginationMetaData] = await context.query.ensureQueryData(
      listDocumentsOptions({ pagination: defaultPagination }),
    );

    return {
      context,
      documents,
      pagination,
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
  const { documents, pagination, paginationMetaData, projects } =
    Route.useLoaderData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  const effectiveSort = pagination.sort.length
    ? pagination.sort
    : documentsPagination.sort;

  const { onFilterChange, onSortChange, getPageChangeParams } = usePagination(
    pagination,
    documentsPagination,
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
                cellPreprocess: (document) => document.title,
                headerName: 'Document title',
                key: 'title',
              },
              {
                cellPreprocess: (document) => document.version,
                headerName: 'Version',
                key: 'version',
              },
            ]}
            entityName={ENTITY.DOCUMENT}
            getPageChangeParams={getPageChangeParams}
            onSortingChange={onSortChange}
            paginationMetaData={paginationMetaData}
            sort={effectiveSort}
            data={documents}
          />
        </CardContent>
      </Card>
    </>
  );
}
