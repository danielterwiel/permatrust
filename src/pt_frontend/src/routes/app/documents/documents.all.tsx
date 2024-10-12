import { Link, createFileRoute } from "@tanstack/react-router";
import type { Row } from "@tanstack/react-table";
import { pt_backend } from "@/declarations/pt_backend";
import { Table } from "@/components/Table";
import { stringifyBigIntObject } from "@/utils/stringifyBigIntObject";
import { handleResult } from "@/utils/handleResult";
import { DEFAULT_PAGINATION } from "@/consts/pagination";
import { z } from "zod";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { Document } from "@/declarations/pt_backend/pt_backend.did";

const documentsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute("/_authenticated/documents")({
  component: Documents,
  validateSearch: (search) => documentsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_documents(pagination);
    const result = handleResult(response);
    const [documents, paginationMetaData] = stringifyBigIntObject(result);
    return {
      ...context,

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
  const { documents, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documents</CardTitle>
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
  );
}
