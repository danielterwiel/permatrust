import { createFileRoute, redirect } from '@tanstack/react-router';
import { Link } from '@/components/Link';

export const Route = createFileRoute('/')({
  component: Authenticate,
  beforeLoad: async ({ context, location }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/organisations',
      });
    }
    return { location };
  },
});

function Authenticate() {
  const search = Route.useSearch();

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      <Link to="/authenticate" search={search}>
        Authenticate
      </Link>
    </div>
  );
}
