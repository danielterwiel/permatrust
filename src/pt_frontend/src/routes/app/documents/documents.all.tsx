import { createFileRoute } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import { Table } from "@/components/Table";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/Link";
import { Button } from "@/components/ui/button";
import { handleResult } from "@/utils/handleResult";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Document } from "@/declarations/pt_backend/pt_backend.did";
import { storage } from "@/utils/localStorage";
import { useState } from "react";
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

const documentsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/documents")({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const organisationId = storage.getItem("activeOrganisationId") as string;
    const projects_response =
      await context.api.call.list_projects_by_organisation_id(
        BigInt(organisationId),
        DEFAULT_PAGINATION, // TODO: does not handle more than 10 projects
      );
    const projects_result = handleResult(projects_response);
    const [projects] = projects_result;

    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await context.api.call.list_documents(pagination);
    const result = handleResult(response);
    const [documents, paginationMetaData] = result;
    return {
      ...context,
      projects,
      documents,
      paginationMetaData,
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
  const { documents, projects, paginationMetaData } = Route.useLoaderData();
  const [selectedProjectId, setSelectedProjectId] = useState<string>();

  return (
    <>
      <div className="text-right pb-4">
        {projects.length === 1 ? (
          <Link
            to="/projects/$projectId/documents/create"
            params={{ projectId: projects[0]?.id.toString() }}
            variant="default"
            className="h-7 gap-1"
            size="sm"
          >
            <Icon name="file-outline" size="sm" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Create document
            </span>
          </Link>
        ) : (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="default">Create document</Button>
              {/* TODO: Icon */}
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
            columnConfig={[
              {
                id: "title",
                headerName: "Document Title",
                cellPreprocess: (title) => title,
              },
              {
                id: "current_version",
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
