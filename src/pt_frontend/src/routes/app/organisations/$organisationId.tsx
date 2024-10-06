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

const origanisationsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_authenticated/organisations/$organisationId'
)({
  component: OrganisationDetails,
  validateSearch: (search) => origanisationsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ params: { organisationId }, deps: { page }, context }) => {
    console.log('loader');
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const projects_response = await pt_backend.list_projects(
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
        origanisation: origanisation,
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
        <CardDescription>Documents</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 pr-6 flex-row-reverse">
          <Link
            to="/organisations/$organisationId/projects/create"
            params={{ organisationId }}
            variant="default"
          >
            <div className="flex gap-2">
              Create Document
              <Icon name="file-outline" size="md" />
            </div>
          </Link>
        </div>
        <Table
          tableData={projects}
          showOpenEntityButton={true}
          routePath="documents"
          paginationMetaData={paginationMetaData}
          columnConfig={[
            {
              id: 'title',
              headerName: 'Document Title',
              cellPreprocess: (title) => title,
            },
            {
              id: 'current_version',
              headerName: 'Version',
              cellPreprocess: (version) => version,
            },
          ]}
        />
      </CardContent>
    </Card>
  );
}
