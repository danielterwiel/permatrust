import { createFileRoute } from '@tanstack/react-router';

import { getPermissionsOptions, getProjectOptions } from '@/api/queries';
import { projectIdSchema } from '@/schemas/entities';

import { CreateRoleForm } from '@/components/create-role-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create role',
  }),
  loader: async ({ context, params }) => {
    const projectId = projectIdSchema.parse(params.projectId);
    const getProjectQuery = context.query.ensureQueryData(
      getProjectOptions(projectId),
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
