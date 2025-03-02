import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { useState } from 'react';
import { z } from 'zod';

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

import { buildFilterField } from '@/utils/buildFilterField';
import { buildPaginationInput } from '@/utils/buildPaginationInput';
import { getActiveOrganizationId } from '@/utils/getActiveOrganizationId';

import { ENTITY, ENTITY_NAME } from '@/consts/entities';
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from '@/consts/pagination';

import { paginationInputSchema } from '@/schemas/pagination';

import type {
  Document,
  PaginationInput,
  Project,
  SortCriteria,
} from '@/declarations/pt_backend/pt_backend.did';
import type { FilterCriteria } from '@/types/pagination';
import type { Row } from '@tanstack/react-table';

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      entity: ENTITY.Document,
      field: buildFilterField(
        ENTITY_NAME.Document,
        FILTER_FIELD.Document.Title,
      ),
      operator: FILTER_OPERATOR.Contains,
      value: '',
    },
  ],
];

const DEFAULT_SORT: [SortCriteria] = [
  {
    field: buildFilterField(ENTITY_NAME.Document, FILTER_FIELD.Document.Title),
    order: SORT_ORDER.Asc,
  },
];

const documentsSearchSchema = z.object({
  pagination: paginationInputSchema.optional(),
});

const DEFAULT_DOCUMENT_PAGINATION: PaginationInput = {
  filters: DEFAULT_FILTERS,
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/documents',
)({
  validateSearch: zodSearchValidator(documentsSearchSchema),
  loaderDeps: ({ search }) => ({
    pagination: { ...DEFAULT_DOCUMENT_PAGINATION, ...search.pagination },
    projectId: search.projectId,
  }),
  beforeLoad: () => ({
    getTitle: () => 'Documents',
  }),
  loader: async ({ context, deps }) => {
    const activeOrganizationId = getActiveOrganizationId();
    const documentPagination = buildPaginationInput(deps.pagination);
    const projectPagination = buildPaginationInput(DEFAULT_PAGINATION);

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
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => {
          return (
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
                  to: '/documents',
                });
              }}
              placeholder="Filter title..."
            />
          );
        })}
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
            entityName={ENTITY_NAME.Document}
            onSortingChange={(newSort) => {
              navigate({
                search: {
                  pagination: {
                    ...pagination,
                    sort: newSort,
                  },
                },
                to: '/documents',
              });
            }}
            paginationMetaData={paginationMetaData}
            sort={pagination.sort}
            tableData={documents}
          />
        </CardContent>
      </Card>
    </>
  );
}
