import { Link, createFileRoute } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { DataTable } from "@/components/DataTable";
import { stringifyBigIntObject } from '@/helpers/stringifyBigIntObject'

export const Route = createFileRoute("/_auth/_layout/projects/")({
  component: Projects,
  loader: async () => {
    const response = await pt_backend.list_projects();
    const projects = JSON.parse(stringifyBigIntObject(response));
    return { projects };
  },
});

function Projects() {
  const { projects } = Route.useLoaderData()
  return (
    <>
      <Link to="/projects/create">Create Project</Link>
      <DataTable tableData={projects} showOpenEntityButton={true} />
    </>
  );
}
