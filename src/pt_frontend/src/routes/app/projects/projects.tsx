import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { Principal } from '@dfinity/principal';
import { handleResult } from '@/utils/handleResult';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card';

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute('/_authenticated/projects/')({
  component: Projects,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ context, deps: { page } }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const response = await pt_backend.list_projects(pagination);
    const result = handleResult(response);
    const [projects, paginationMetaData] = stringifyBigIntObject(result);
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

function Projects() {
  const { projects, paginationMetaData } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>
          View your projects or create a new project
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link to="/projects/create" variant="default">
            <div className="flex gap-2">
              Create Project
              <Icon name="rectangle-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table
          tableData={projects}
          showOpenEntityButton={true}
          routePath=""
          paginationMetaData={paginationMetaData}
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
      </CardContent>
    </Card>
  );
}
