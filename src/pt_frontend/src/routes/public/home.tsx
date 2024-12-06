import { createFileRoute } from '@tanstack/react-router';

import { Link } from '@/components/link';

export const Route = createFileRoute('/')({
  component: Authenticate,
});

function Authenticate() {
  const search = Route.useSearch();

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      <Link search={search} to="/login">
        Authenticate
      </Link>
    </div>
  );
}
