import { z } from "zod";
import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { getActiveOrganisationId } from "@/utils/getActiveOrganisationId";
import { buildPaginationInput } from "@/utils/buildPaginationInput";
import { buildFilterField } from "@/utils/buildFilterField";
import { Table } from "@/components/Table";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { FilterInput } from "@/components/FilterInput";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { paginationInputSchema } from "@/schemas/pagination";
import type { FilterCriteria } from "@/types/pagination";
import type { Row } from "@tanstack/react-table";
import type {
  Document,
  PaginationInput,
  Sort,
  SortCriteria,
} from "@/declarations/pt_backend/pt_backend.did";
import type { _SERVICE } from "@/declarations/pt_backend/pt_backend.did.d";
import {
  DEFAULT_PAGINATION,
  FILTER_FIELD,
  FILTER_OPERATOR,
  SORT_ORDER,
} from "@/consts/pagination";
import { ENTITY, ENTITY_NAME } from "@/consts/entities";

const DEFAULT_FILTERS: [FilterCriteria[]] = [
  [
    {
      value: "",
      entity: ENTITY.Document,
      field: buildFilterField(
        ENTITY_NAME.Document,
        FILTER_FIELD.Document.Title,
      ),
      operator: FILTER_OPERATOR.Contains,
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
  page_number: DEFAULT_PAGINATION.page_number,
  page_size: DEFAULT_PAGINATION.page_size,
  filters: DEFAULT_FILTERS,
  sort: DEFAULT_SORT,
};

export const Route = createFileRoute("/_authenticated/documents")({
  component: Documents,
  validateSearch: (search) => {
    return documentsSearchSchema.parse(search);
  },
  beforeLoad: () => ({
    getTitle: () => "Documents",
  }),
  loaderDeps: ({ search: { pagination } }) => ({
    pagination,
  }),
  loader: async ({ context, deps: { pagination } }) => {
    const activeOrganisationId = getActiveOrganisationId();
    const documentPagination = buildPaginationInput(
      DEFAULT_DOCUMENT_PAGINATION,
      pagination,
    );
    const projectPagination = buildPaginationInput(DEFAULT_PAGINATION, {});
    const [projects] = await context.api.call.list_projects_by_organisation_id(
      activeOrganisationId,
      projectPagination,
    );
    const [documents, paginationMetaData] =
      await context.api.call.list_documents(documentPagination);
    return {
      context,
      projects,
      documents,
      paginationMetaData,
      pagination: documentPagination,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Document>) => {
  return (
    <Link
      to="/projects/$projectId/documents/$documentId"
      variant="outline"
      params={{
        projectId: row.original.project.toString(),
        documentId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Documents() {
  const { projects, documents, pagination, paginationMetaData } =
    Route.useLoaderData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();
  const navigate = useNavigate();

  return (
    <>
      <div className="flex items-center justify-between pb-4">
        {pagination.filters[0]?.map((filterCriteria) => {
          return (
            <FilterInput
              key={filterCriteria.entity.toString()}
              filterCriteria={filterCriteria}
              placeholder="Filter title..."
              onChange={(filterCriteria: FilterCriteria) => {
                navigate({
                  to: "/documents",
                  search: {
                    pagination: {
                      ...pagination,
                      filters: [[filterCriteria]],
                    },
                  },
                });
              }}
            />
          );
        })}
        {projects.length === 1 ? (
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId: projects[0]?.id.toString() }}
            variant="default"
            className="h-7 gap-1"
            size="sm"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap text-sm">
              Create document
            </span>
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default" size="sm">
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
                    {projects.map((project) => (
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
                to="/projects/$projectId/documents/create"
                params={{ projectId: selectedProjectId }}
                variant="default"
                disabled={!selectedProjectId}
                className="mt-4"
              >
                <Icon name="file-outline" size="sm" className="mr-2" />
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
              name="files-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Documents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Document>
            tableData={documents}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            entityName={ENTITY_NAME.Document}
            sort={pagination.sort}
            onSortingChange={(newSort: Sort) => {
              navigate({
                to: "/documents",
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
                id: "title",
                headerName: "Document title",
                cellPreprocess: (title) => title,
              },
              {
                id: "version",
                headerName: "Version",
                cellPreprocess: (version) => version,
              },
            ]}
          />
        </CardContent>
      </Card>
    </>
  );
}
