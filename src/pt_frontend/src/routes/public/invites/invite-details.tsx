import { createFileRoute } from '@tanstack/react-router';

import { getInviteOptions } from '@/api/queries/invites';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/icon';

export const Route = createFileRoute(
  '/_initialized/invites/$inviteId',
)({
  loader: async ({ context, params }) => {
    const invite = await context.query.ensureQueryData(getInviteOptions(params.inviteId));
    return { invite };
  },
  component: InviteDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function InviteDetails() {
  const { invite } = Route.useLoaderData();

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
            Invite
          </CardTitle>
        </CardHeader>
        <CardContent>
          Invite {invite.id.toString()}
        </CardContent>
      </Card>
    </div>
  );
}
