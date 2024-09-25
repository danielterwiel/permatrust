import { createFileRoute } from "@tanstack/react-router";
import { pt_backend } from "@/declarations/pt_backend";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth/_layout/projects/$projectId/")({
  component: Project,
  loader: async ({ params }) => {
    return pt_backend.list_documents(BigInt(params.projectId));
  },
});

// TODO: unknown
function Project() {
  const { projectId } = Route.useParams();
  return (
    <>
      <h2>project {projectId}</h2>

      <h3>Documents</h3>
      <Link to={`/projects/${projectId}/create`}>Create</Link>
    </>
  );
}
