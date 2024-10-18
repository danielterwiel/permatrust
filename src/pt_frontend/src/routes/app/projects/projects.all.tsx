import { createFileRoute } from "@tanstack/react-router";
import { Table } from "@/components/Table";
import { handleResult } from "@/utils/handleResult";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/Link";
import { formatDateTime } from "@/utils/date";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import type { Row } from "@tanstack/react-table";
import type { Project } from "@/declarations/pt_backend/pt_backend.did";

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/projects/")({
  component: Projects,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await context.api.call.list_projects(pagination);
    const result = handleResult(response);
    const [projects, paginationMetaData] = result;
    return {
      context,

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
  console.log('PPRRRROJECTS', projects);
  console.log('paginationMetaData', paginationMetaData);

  return (
    <>
      <div className="text-right pb-4">
        <Link
          to="/projects/create"
          variant="default"
          className="h-7 gap-1"
          size="sm"
        >
          <Icon name="briefcase-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create project
          </span>
        </Link>
      </div>
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
          <Table<Project>
            tableData={projects}
            actions={RowActions}
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
    </>
  );
}
