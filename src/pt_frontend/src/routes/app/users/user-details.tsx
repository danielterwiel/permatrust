import { createFileRoute } from '@tanstack/react-router';

import { getUserOptions } from '@/api/queries/users';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

import { formatUserName } from '@/utils/format-user-name';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/$userId',
)({
  loader: async ({ context }) => {
    const user = await context.query.ensureQueryData(getUserOptions());
    context.getTitle = () => formatUserName(user);
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
