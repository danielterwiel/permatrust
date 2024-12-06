import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/components/link';

export const Route = createFileRoute('/_initialized/unauthorized')({
  component: Unauthorized,
});

function Unauthorized() {
  const search = Route.useSearch();

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      <h1>Unauthorized</h1>
      <Link search={search} to="/login">
        Authenticate
      </Link>
    </div>
  );
}
