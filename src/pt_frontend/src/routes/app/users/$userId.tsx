import { createFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Icon } from '@/components/ui/Icon';

export const Route = createFileRoute(
  '/_authenticated/_onboarded/users/$userId',
)({
  component: UserDetails,
  beforeLoad: () => ({
    getTitle: () => 'User',
  }),
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
            name="user-outline"
            size="lg"
            className="text-muted-foreground pb-1 mr-2"
          />
          User
        </CardTitle>
      </CardHeader>
    </Card>
  );
}
