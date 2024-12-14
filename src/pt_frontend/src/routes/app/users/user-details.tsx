import { createFileRoute } from '@tanstack/react-router';

import { api } from '@/api';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/$userId',
)({
  beforeLoad: () => ({
    getTitle: () => 'User',
  }),
  loader: async () => {
    const user = await api.get_user(); // TODO: params
    return { user };
  },
  component: UserDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function UserDetails() {
  const { user } = Route.useLoaderData();

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>
            <Icon
              className="text-muted-foreground pb-1 mr-2"
              name="user-outline"
              size="lg"
            />
            User
          </CardTitle>
        </CardHeader>
        <CardContent>
          User: {user.first_name} {user.last_name}
        </CardContent>
      </Card>
    </div>
  );
}
