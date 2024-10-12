import { createFileRoute } from '@tanstack/react-router';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export const Route = createFileRoute('/_authenticated/users/$userId')({
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
        <CardTitle>User</CardTitle>
      </CardHeader>
    </Card>
  );
}
