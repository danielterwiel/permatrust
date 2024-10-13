import { Link } from '@/components/Link';
import { createFileRoute } from '@tanstack/react-router';
import { pt_backend } from '@/declarations/pt_backend';
import { Table } from '@/components/Table';
import { stringifyBigIntObject } from '@/utils/stringifyBigIntObject';
import { handleResult } from '@/utils/handleResult';
import { Icon } from '@/components/ui/Icon';
import { DEFAULT_PAGINATION } from '@/consts/pagination';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Principal } from '@dfinity/principal';
import { formatDateTime } from '@/utils/date';
import { storage } from '@/utils/localStorage';

import type { Row } from '@tanstack/react-table';
import type { Project } from '@/declarations/pt_backend/pt_backend.did';

const projectsSearchSchema = z.object({
  page: z.number().int().nonnegative().optional(),
});

export const Route = createFileRoute(
  '/_authenticated/organisations/$organisationId/',
)({
  component: OrganisationDetails,
  validateSearch: (search) => projectsSearchSchema.parse(search),
  beforeLoad: () => ({
    getTitle: () => 'Organisation',
  }),
  loaderDeps: ({ search: { page } }) => ({ page }),
  loader: async ({ deps: { page }, context }) => {
    const organisationId = storage.getItem('activeOrganisationId') as string;
    const pagination = {
      ...DEFAULT_PAGINATION,
      page_number: BigInt(page ?? 1),
    };
    const projects_response = await pt_backend.list_projects_by_organisation_id(
      BigInt(organisationId),
      pagination,
    );
    const origanisation_response = await pt_backend.get_organisation(
      BigInt(organisationId),
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
    };
  },
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function OrganisationDetails() {
  const { projects, paginationMetaData, active } = Route.useLoaderData();

  const RowActions = (row: Row<Project>) => {
    return (
      <Link
        to="/projects/$projectId"
        variant="outline"
        params={{
          projectId: row.id,
        }}
      >
        Open
      </Link>
    );
  };

  return (
    <>
      <div className="text-right pb-4">
        <Link
          to="/projects/create"
          variant="default"
          className="h-7 gap-1"
          size="sm"
        >
          <Icon name="briefcase-outline" size="sm" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Create project
          </span>
        </Link>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              name="building-outline"
              size="lg"
              className="text-muted-foreground pb-1 mr-2"
            />
            {active.origanisation.name}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table<Project>
            tableData={projects}
            actions={RowActions}
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
    </>
  );
}
