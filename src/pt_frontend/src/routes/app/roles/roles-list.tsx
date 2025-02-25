import { createFileRoute } from '@tanstack/react-router';

import { api } from '@/api';

import { RolesList } from '@/components/roles-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { toNumberSchema } from '@/schemas/primitives';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/list',
)({
  loader: async ({ params }) => {
    const projectId = toNumberSchema.parse(params.projectId);
    const roles = await api.get_project_roles({ project_id: projectId });

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
