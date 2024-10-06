import { createFileRoute, redirect } from '@tanstack/react-router';
import { Link } from '@/components/Link';

export const Route = createFileRoute('/')({
  component: Authenticate,
  beforeLoad: async ({ context }) => {
    if (context.auth.authenticated) {
      throw redirect({
        to: '/projects',
      });
    }
    return context;
  },
});

function Authenticate() {
  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      <Link to="/authenticate">Authenticate</Link>
    </div>
  );
}
