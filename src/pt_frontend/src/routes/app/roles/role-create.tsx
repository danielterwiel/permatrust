import { createFileRoute } from '@tanstack/react-router';

import { api } from '@/api';

import { CreateRoleForm } from '@/components/create-role-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/projects/$projectId/roles/create',
)({
  beforeLoad: () => ({
    getTitle: () => 'Create role',
  }),
  loader: async () => {
    const permissions = await api.get_permissions();

    return {
      permissions,
    };
  },
  component: RoleCreate,
});

function RoleCreate() {
  const { permissions } = Route.useLoaderData();
  const { projectId } = Route.useParams();

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
          <CreateRoleForm permissions={permissions} projectId={projectId} />
        </CardContent>
      </Card>
    </div>
  );
}
