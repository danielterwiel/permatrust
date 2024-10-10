import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Principal } from '@dfinity/principal';
import { formatDateTime } from '@/utils/date';

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_authenticated/organisations/$organisationId/'
)({
  component: OrganisationDetails,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ params: { organisationId }, deps: { page }, context }) => {
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const projects_response = await pt_backend.list_projects_by_organisation_id(
      BigInt(organisationId),
      pagination
    );
    const origanisation_response = await pt_backend.get_organisation(
      BigInt(organisationId)
    );
    const origanisation_result = handleResult(origanisation_response);
    const projects_result = handleResult(projects_response);
    const [projects, paginationMetaData] =
      stringifyBigIntObject(projects_result);
    const origanisation = stringifyBigIntObject(origanisation_result);

    return {
      ...context,

      projects,
      paginationMetaData,

      active: {
        origanisation,
      },

      organisationId,
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationDetails() {
  const { organisationId } = Route.useParams();
  const { projects, paginationMetaData, active } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>{active.origanisation.name}</CardTitle>
        <CardDescription>Organisation</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link
            to="/projects/create"
            params={{ organisationId }}
            variant="default"
          >
            <div className="flex gap-2">
              Create project
              <Icon name="file-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table
          tableData={projects}
          openLinkTo="/projects/$projectId"
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'name',
              headerName: 'Project Name',
              cellPreprocess: (v) => v,
            },
            {
              id: 'created_by',
              headerName: 'Created by',
              cellPreprocess: (createdBy) =>
                Principal.fromUint8Array(createdBy).toString(),
            },
            {
              id: 'created_at',
              headerName: 'Created at',
              cellPreprocess: (createdAt) => formatDateTime(createdAt),
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
