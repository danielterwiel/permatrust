import { useState } from 'react';
import { createFileRoute, redirect } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/Loading';
import { useNavigate } from '@tanstack/react-router';
import { DEFAULT_PAGINATION } from '@/consts/pagination';

export const Route = createFileRoute('/authenticate')({
  component: Authenticate,
  beforeLoad: async ({ context }) => {
    if (context.auth.isAuthenticated) {
      throw redirect({
        to: '/organisations',
        search: { pagination: DEFAULT_PAGINATION },
      });
    }
    return context;
  },
});

function Authenticate() {
  const { auth } = Route.useRouteContext({
    select: ({ auth }) => ({ auth }),
  });
  const navigate = useNavigate();
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const authenticate = async () => {
    setIsAuthenticating(true);
    await auth.initializeAuth();
    if (auth.isAuthenticated) {
      navigate({
        to: '/organisations',
        search: { pagination: DEFAULT_PAGINATION },
      });
      return;
    }
    const result = await auth.login();
    if (result) {
      navigate({
        to: '/organisations',
        search: { pagination: DEFAULT_PAGINATION },
      });
    }
    // TODO: error handling
  };

  return (
    <div className="grid place-items-center min-h-dvh pb-36">
      {isAuthenticating ? (
        <Button disabled={true}>
          <Loading text="Authenticating..." />
        </Button>
      ) : (
        <Button
          disabled={isAuthenticating}
          type="submit"
          onClick={authenticate}
        >
          Authenticate
        </Button>
      )}
    </div>
  );
}
