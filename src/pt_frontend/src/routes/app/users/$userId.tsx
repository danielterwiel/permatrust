import { createFileRoute } from '@tanstack/react-router';

import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';

export const Route = createFileRoute(
  '/_initialized/_authenticated/_onboarded/users/$userId',
)({
  beforeLoad: () => ({
    getTitle: () => 'User',
  }),
  component: UserDetails,
  errorComponent: ({ error }) => {
    return <div>Error: {error.message}</div>;
  },
});

function UserDetails() {
  return (
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
    </Card>
  );
}
