import { createFileRoute } from '@tanstack/react-router';
import { zodSearchValidator } from '@tanstack/router-zod-adapter';
import { z } from 'zod';

import { getPermissionsOptions, getProjectOptions } from '@/api/queries';

import { CreateRoleForm } from '@/components/create-role-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

const roleCreateSearchSchema = z.object({
  projectId: z.number(),
});

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/create',
)({
  validateSearch: zodSearchValidator(roleCreateSearchSchema),
  loaderDeps: ({ search }) => ({
    projectId: search.projectId,
  }),
  beforeLoad: () => ({
    getTitle: () => 'Create role',
  }),
  loader: async ({ context, deps }) => {
    const getProjectQuery = context.query.ensureQueryData(
      getProjectOptions(deps.projectId),
    );
    const getPermissionsQuery = context.query.ensureQueryData(
      getPermissionsOptions(),
    );

    const [project, permissions] = await Promise.all([
      getProjectQuery,
      getPermissionsQuery,
    ]);
    return { permissions, project };
  },
  component: RoleCreate,
});

function RoleCreate() {
  const { permissions, project } = Route.useLoaderData();

  return (
    <div className="pt-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="user-check-outline"
              size="lg"
            />
            Create role
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CreateRoleForm permissions={permissions} project={project} />
        </CardContent>
      </Card>
    </div>
  );
}
