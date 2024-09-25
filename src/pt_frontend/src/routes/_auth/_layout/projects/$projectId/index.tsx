import { Link } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { useState, useEffect } from "react";
import { DataTable, type TableData } from "@/components/DataTable";
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject'
import { Loading } from "@/components/Loading";

export const Route = createFileRoute("/_auth/_layout/projects/$projectId/")({
  component: Project,
  loader: async ({ params }) => {
    return pt_backend.list_documents(BigInt(params.projectId));
  },
});

function Project() {
  const { projectId } = Route.useParams();
  const [loading, setLoading] = useState<boolean | undefined>(undefined);
  const [response, setResponse] = useState<TableData>([]);

  useEffect(() => {
    if (loading === undefined) {
      getDocuments();
    }
  }, [loading]);

  const getDocuments = async () => {
    setLoading(true);
    const response = await pt_backend.list_documents(BigInt(projectId));
    const responseAll = await pt_backend.list_all_documents();
    console.log('all', responseAll);
    console.log("response", response);
    const parsedResponse = JSON.parse(stringifyBigIntObject(response));
    setResponse(parsedResponse);
    console.log('parsedResponse', parsedResponse);
    setLoading(false);
  };

  return (
    <>
      <h2>project {projectId}</h2>
      <h3>Documents</h3>
      <Link to={`/projects/${projectId}/create`}>Create</Link>
      {loading ? <Loading /> : <></>}
      {!loading ? <DataTable tableData={response} /> : <></>}
    </>
  );
}
