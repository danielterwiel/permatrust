import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { pt_backend } from "@/declarations/pt_backend";
import { DataTable, type TableData } from "@/components/DataTable";
import { Loading } from "@/components/Loading";
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject'

export const Route = createFileRoute("/_auth/_layout/projects/")({
  component: Projects,
});

function Projects() {
  const [response, setResponse] = useState<TableData>([]);
  const [loading, setLoading] = useState<boolean | undefined>(undefined);

  useEffect(() => {
    if (loading === undefined) {
      getProjects();
    }
  }, [loading]);

  const getProjects = async () => {
    setLoading(true);
    const response = await pt_backend.list_projects();
    console.log("response", response);
    const parsedResponse = JSON.parse(stringifyBigIntObject(response));
    setResponse(parsedResponse);
    setLoading(false);
  };

  return (
    <>
      <a href="/projects/create">Create</a>
      {loading ? <Loading /> : <></>}
      {!loading ? <DataTable tableData={response} showOpenEntityButton={true} /> : <></>}
    </>
  );
}
