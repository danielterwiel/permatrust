import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/components/Link';

export const Route = createFileRoute('/_initialized/unauthorised')({
  component: Unauthorised,
});

function Unauthorised() {
  const search = Route.useSearch();

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      <h1>Unauthorised</h1>
      <Link search={search} to="/authenticate">
        Authenticate
      </Link>
    </div>
  );
}
