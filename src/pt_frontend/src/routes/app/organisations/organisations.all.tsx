import { Link } from "@/components/Link";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Table } from "@/components/Table";
import { handleResult } from "@/utils/handleResult";
import { Icon } from "@/components/ui/Icon";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/utils/date";
import { storage } from "@/utils/localStorage";
import type { Row } from "@tanstack/react-table";
import type { Organisation } from "@/declarations/pt_backend/pt_backend.did";

const organisationsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/organisations/")({
  component: Organisations,
  validateSearch: (search) => organisationsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await context.api.call.list_organisations(pagination);
    const result = handleResult(response);
    if (!result) {
      throw new Error("Failed to fetch organisations");
    }
    const [organisations, paginationMetaData] = result;

    return {
      ...context,

      organisations,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Organisations() {
  const { organisations, paginationMetaData } = Route.useLoaderData();
  const navigate = useNavigate();

  const RowActions = (row: Row<Organisation>) => {
    const setOrganisationIdLocalStorage = () => {
      storage.setItem("activeOrganisationId", row.id);
      navigate({ to: `/organisations/${row.id}` });
    };

    return (
      <Button variant="outline" onClick={setOrganisationIdLocalStorage}>
        Open
      </Button>
    );
  };

  return (
    <>
      <div className="text-right pb-4">
        <Link
          to="/organisations/create"
          variant="default"
          className="h-7 gap-1"
          size="sm"
        >
          <Icon name="building-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create Organisation
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="buildings-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            Organisations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table
            tableData={organisations}
            actions={RowActions}
            paginationMetaData={paginationMetaData}
            columnConfig={[
              {
                id: "name",
                headerName: "Name",
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
