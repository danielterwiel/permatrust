import { createFileRoute } from '@tanstack/react-router';

import { getProjectRolesOptions } from '@/api/queries/permissions';
import { projectIdSchema } from '@/schemas/entities';

import { RolesList } from '@/components/roles-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/list',
)({
  loader: async ({ context, params }) => {
    const projectId = projectIdSchema.parse(params.projectId);
    const roles = await context.query.ensureQueryData(
      getProjectRolesOptions(projectId),
    );

    return {
      roles,
    };
  },
  component: RolesCreate,
});

function RolesCreate() {
  const { roles } = Route.useLoaderData();

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Icon
            className="text-muted-foreground pb-1 mr-2"
            name="user-check-outline"
            size="lg"
          />
          Roles
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RolesList roles={roles} />
      </CardContent>
    </Card>
  );
}
