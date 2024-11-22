import { createFileRoute } from '@tanstack/react-router';
import { Link } from '@/components/Link';

export const Route = createFileRoute('/')({
  component: Authenticate,
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
