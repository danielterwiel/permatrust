import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { DataTable } from '@/components/DataTable';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { Principal } from '@dfinity/principal';
import { handleResult } from '@/utils/handleResult';

export const Route = createFileRoute('/_auth/_layout/projects/')({
  component: Projects,
  loader: async () => {
    const response = await pt_backend.list_projects();
    console.log('response', response);
    const result = handleResult(response);
    const projects = stringifyBigIntObject(result);
    return { projects };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function Projects() {
  const { projects } = Route.useLoaderData();

  return (
    <>
      <div className="flex gap-4 pr-6 flex-row-reverse">
        <Link to="/projects/create" variant="default">
          Create Project
        </Link>
      </div>
      <DataTable
        tableData={projects}
        showOpenEntityButton={true}
        routePath=""
        columnConfig={[
          {
            id: 'name',
            headerName: 'Project Name',
            cellPreprocess: (v) => v,
          },
          {
            id: 'author',
            cellPreprocess: (author) =>
              Principal.fromUint8Array(author).toString(),
          },
        ]}
      />
    </>
  );
}
