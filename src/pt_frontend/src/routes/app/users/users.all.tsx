import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon } from "@/components/ui/Icon";
import { Link } from "@/components/Link";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { handleResult } from "@/utils/handleResult";
import { Table } from "@/components/Table";
import type { Row } from "@tanstack/react-table";
import type { User } from "@/declarations/pt_backend/pt_backend.did";

const usersSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/users/")({
  component: Users,
  validateSearch: (search) => usersSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await context.api.call.list_users(pagination);
    const result = handleResult(response);
    const [users, paginationMetaData] = result;
    return {
      ...context,

      users,
      paginationMetaData,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

const RowActions = (row: Row<User>) => {
  return (
    <Link
      to="/users/$userId"
      variant="outline"
      params={{
        userId: row.id,
      }}
    >
      Open
    </Link>
  );
};

function Users() {
  const { users, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            name="users-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          Users
        </CardTitle>
        <Table<User>
          tableData={users}
          actions={RowActions}
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: "first_name",
              headerName: "First name",
              cellPreprocess: (firstName) => firstName,
            },
            {
              id: "last_name",
              headerName: "Last name",
              cellPreprocess: (lastName) => lastName,
            },
          ]}
        />
      </CardHeader>
    </Card>
  );
}
