import { createFileRoute } from "@tanstack/react-router";
import { formatDateTime } from "@/utils/formatDateTime";
import { storage } from "@/utils/localStorage";
import { z } from "zod";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { Link } from "@/components/Link";
import { Table } from "@/components/Table";
import { Icon } from "@/components/ui/Icon";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Row } from "@tanstack/react-table";
import type { Project } from "@/declarations/pt_backend/pt_backend.did";

const projectsSearchSchema = z.object({
  page_number: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/projects/")({
  component: Projects,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  loaderDeps: ({ search: { page_number } }) => ({ page_number }),
  loader: async ({ context, deps: { page_number } }) => {
    const organisationId = storage.getItem("activeOrganisationId", "");
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: page_number ?? 1,
    };
    const [projects, paginationMetaData] =
      await context.api.call.list_projects_by_organisation_id(
        BigInt(organisationId),
        pagination,
      );
    return {
      ...context,

      projects,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<Project>) => {
  return (
    <Link
      to="/projects/$projectId"
      variant="outline"
      params={{
        projectId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Projects() {
  const { projects, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="briefcase-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link to="/projects/create" variant="default">
            <div className="flex gap-2">
              <Icon name="briefcase-outline" size="md" />
              Create Project
            </div>
          </Link>
        </div>
        <Table<Project>
          actions={RowActions}
          tableData={projects}
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: "name",
              headerName: "Project Name",
              cellPreprocess: (v) => v,
            },
            {
              id: "created_by",
              headerName: "Created by",
              cellPreprocess: (createdBy) => createdBy.toString(),
            },
            {
              id: "created_at",
              headerName: "Created at",
              cellPreprocess: (createdAt) => formatDateTime(createdAt),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
